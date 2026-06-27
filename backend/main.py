"""UrbanHive main FastAPI engine."""

from __future__ import annotations

import logging
import os
import random
import time
from typing import Any, TypeAlias

import httpx
from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from modules.ev_rerouting.ev_module import reroute_ev
from modules.mock_data import chargers, parking_lots, petrol_pumps, roads, route_congestion
from modules.parking.parking_module import get_parking_status
from modules.petrol_pump.petrol_module import recommend_pump

# ── Configuration ─────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

RL_AGENT_HOST = os.getenv("RL_AGENT_HOST", "localhost")
RL_AGENT_PORT = os.getenv("RL_AGENT_PORT", "8001")
RL_AGENT_URL = f"http://{RL_AGENT_HOST}:{RL_AGENT_PORT}"
RL_AGENT_TIMEOUT = 2.0

JsonDict: TypeAlias = dict[str, Any]

# ── Simulation state ──────────────────────────────────────────────────────────
_simulation_tick: int = 0

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="UrbanHive City Mobility OS",
    description="AI-powered traffic and mobility management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic models ───────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    """Health check response."""
    status: str


class SimulateTickResponse(BaseModel):
    """Simulation tick response."""

    tick: int
    timestamp: int
    message: str


class EmergencyRequest(BaseModel):
    """Emergency activation request."""
    origin: str = "Vijay Nagar"
    destination: str = "MY Hospital"
    vehicle_type: str = "ambulance"


class RLActionResponse(BaseModel):
    """RL action response."""

    action: int
    phase: str
    junction: str
    queue_obs: list[float]
    source: str


class EmergencyResponse(BaseModel):
    """Emergency corridor response."""

    status: str
    vehicle_type: str
    origin: str
    destination: str
    corridor: list[JsonDict]
    affected_junctions: list[str]
    eta_minutes: int
    timestamp: int


# ── Helpers ───────────────────────────────────────────────────────────────────

def _congestion_color(congestion: str) -> str:
    """Map congestion level to hex color code."""
    return {
        "free": "#22c55e",
        "moderate": "#f59e0b",
        "heavy": "#ef4444"
    }.get(congestion, "#94a3b8")


def _timestamp() -> int:
    """Return the current Unix timestamp."""

    return int(time.time())


def _update_history(record: JsonDict, new_value: float, max_points: int = 200) -> None:
    """Append a value to the record history while keeping a fixed window."""

    history = record.setdefault("history", [])
    if len(history) >= max_points:
        history.pop(0)
    history.append(new_value)


def _ev_charger_snapshot(charger_id: str) -> JsonDict:
    """Build a single EV charger snapshot with metadata and routing advice."""

    charger = chargers[charger_id]
    status = reroute_ev(charger_id, chargers)
    return {
        "charger_id": charger_id,
        "name": charger.get("name", charger_id),
        "lat": charger.get("lat", 0),
        "lon": charger.get("lon", 0),
        "load": charger.get("load", 0),
        "capacity": charger.get("capacity", 0),
        **status,
    }


def _ev_status_payload() -> JsonDict:
    """Return all EV charger statuses in the public response format."""

    return {
        "chargers": {
            charger_id: _ev_charger_snapshot(charger_id)
            for charger_id in chargers
        },
        "timestamp": _timestamp(),
    }


def _parking_status_payload() -> JsonDict:
    """Return parking status in the public response format."""

    return {
        "parking_lots": get_parking_status(parking_lots),
        "timestamp": _timestamp(),
    }


def _petrol_recommendation_payload() -> JsonDict:
    """Return petrol recommendation in the public response format."""

    return {
        **recommend_pump(petrol_pumps, route_congestion),
        "timestamp": _timestamp(),
    }


def _road_payload() -> JsonDict:
    """Return road state with display colors derived from congestion."""

    return {
        road_id: {
            **road,
            "color": _congestion_color(str(road.get("congestion", "moderate"))),
        }
        for road_id, road in roads.items()
    }


def _rl_action_payload() -> RLActionResponse:
    """Get an RL action with a safe mock fallback if the PPO server fails."""

    mock_queues = "8,6,10,5"
    fallback_queue_obs = [float(x) / 50.0 for x in mock_queues.split(",")]

    try:
        resp = httpx.get(
            f"{RL_AGENT_URL}/rl/action",
            params={"queues": mock_queues},
            timeout=RL_AGENT_TIMEOUT,
        )
        resp.raise_for_status()

        data = resp.json()
        phase = int(data.get("phase", 0))
        logger.info("RL agent returned phase: %s", phase)
        return RLActionResponse(
            action=phase,
            phase="NS_GREEN" if phase == 0 else "EW_GREEN",
            junction="A1",
            queue_obs=fallback_queue_obs,
            source="live",
        )
    except (httpx.TimeoutException, httpx.ConnectError, httpx.HTTPStatusError, ValueError):
        logger.warning("RL agent unavailable, using fallback action")
    except Exception as exc:  # pragma: no cover - defensive fallback
        logger.warning("RL agent error: %s", exc)

    phase = _simulation_tick % 2
    return RLActionResponse(
        action=phase,
        phase="NS_GREEN" if phase == 0 else "EW_GREEN",
        junction="A1",
        queue_obs=[0.3, 0.2, 0.4, 0.1],
        source="mock",
    )


def _advance_simulation() -> None:
    """Advance the in-memory simulation by one step."""

    global _simulation_tick
    _simulation_tick += 1

    for charger in chargers.values():
        current_load = float(charger.get("load", 50))
        new_val = max(0.0, min(100.0, current_load + random.uniform(-3, 3)))
        _update_history(charger, new_val)
        charger["load"] = round(new_val, 1)

    for lot in parking_lots.values():
        capacity = int(lot.get("capacity", 100))
        current_occupied = float(lot.get("occupied", 50))
        new_val = max(0.0, min(float(capacity), current_occupied + random.uniform(-2, 3)))
        _update_history(lot, new_val)
        lot["occupied"] = int(round(new_val))

    for pump in petrol_pumps.values():
        current_queue = float(pump.get("queue", 10))
        new_val = max(0.0, current_queue + random.uniform(-2, 2))
        _update_history(pump, new_val)
        pump["queue"] = round(new_val, 1)

    speed_ranges = {
        "free": (45, 60),
        "moderate": (25, 35),
        "heavy": (10, 20),
    }
    for road in roads.values():
        congestion = str(road.get("congestion", "moderate"))
        low, high = speed_ranges.get(congestion, (20, 40))
        road["speed_kmh"] = round(random.uniform(low, high), 1)


def _emergency_payload(req: EmergencyRequest) -> EmergencyResponse:
    """Build the emergency corridor response using the hardcoded route."""

    corridor = _EMERGENCY_CORRIDORS["default"]
    return EmergencyResponse(
        status="active",
        vehicle_type=req.vehicle_type,
        origin=req.origin,
        destination=req.destination,
        corridor=corridor,
        affected_junctions=["Vijay Nagar Square", "Palasia Square", "Race Course Road"],
        eta_minutes=random.randint(7, 12),
        timestamp=_timestamp(),
    )


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="ok")


# ── EV ────────────────────────────────────────────────────────────────────────

@app.get("/ev/status")
def ev_status() -> JsonDict:
    """Get status of all EV chargers with predictions."""
    return _ev_status_payload()


@app.get("/ev/status/{charger_id}")
def ev_status_single(charger_id: str = Path(..., description="EV charger identifier")) -> JsonDict:
    """Get status of a single EV charger."""
    if charger_id not in chargers:
        raise HTTPException(
            status_code=404,
            detail=f"Charger {charger_id} not found"
        )
    return _ev_charger_snapshot(charger_id)


# ── Parking ───────────────────────────────────────────────────────────────────

@app.get("/parking/status")
def parking_status() -> JsonDict:
    """Get status of all parking lots with predictions."""
    return _parking_status_payload()


# ── Petrol ────────────────────────────────────────────────────────────────────

@app.get("/petrol/recommend")
def petrol_recommend() -> JsonDict:
    """Get petrol pump recommendation based on queue predictions."""
    return _petrol_recommendation_payload()


# ── RL Action (proxy to agent_api, fallback to mock) ─────────────────────────

@app.get("/rl/action", response_model=RLActionResponse)
def rl_action() -> RLActionResponse:
    """Get traffic light phase from RL agent.
    
    Returns a phase decision from the PPO agent if available, else returns mock.
    """
    return _rl_action_payload()


# ── Simulate tick ─────────────────────────────────────────────────────────────

@app.post("/simulate/tick", response_model=SimulateTickResponse)
def simulate_tick() -> SimulateTickResponse:
    """Advance simulation by one tick.
    
    Updates charger loads, parking occupancy, petrol queues, and road speeds
    using realistic random walk patterns.
    """
    _advance_simulation()

    logger.info("Simulation tick %s completed", _simulation_tick)
    return SimulateTickResponse(
        tick=_simulation_tick,
        timestamp=_timestamp(),
        message=f"Tick {_simulation_tick}: all mock data updated",
    )


# ── Emergency corridor ────────────────────────────────────────────────────────

# Hardcoded corridors for demo — Vijay Nagar → MY Hospital, Indore
_EMERGENCY_CORRIDORS: dict[str, list[JsonDict]] = {
    "default": [
        {"lat": 22.7196, "lon": 75.8577, "name": "Vijay Nagar Square"},
        {"lat": 22.7183, "lon": 75.8612, "name": "Scheme 54 Junction"},
        {"lat": 22.7165, "lon": 75.8645, "name": "Palasia Square"},
        {"lat": 22.7148, "lon": 75.8670, "name": "Curewell Hospital Junction"},
        {"lat": 22.7130, "lon": 75.8698, "name": "Race Course Road"},
        {"lat": 22.7115, "lon": 75.8720, "name": "MY Hospital Gate"},
    ]
}


@app.post("/emergency/activate")
def emergency_activate(req: EmergencyRequest) -> EmergencyResponse:
    """Activate emergency corridor for ambulance/fire truck.
    
    Clears traffic, provides ETA, and returns route geometry.
    """
    logger.info(
        "Emergency activated: %s from %s to %s",
        req.vehicle_type,
        req.origin,
        req.destination,
    )

    return _emergency_payload(req)


@app.post("/emergency/deactivate")
def emergency_deactivate() -> JsonDict:
    """Deactivate emergency corridor."""
    logger.info("Emergency deactivated")
    return {
        "status": "inactive",
        "timestamp": _timestamp(),
    }


# ── Combined /all endpoint (web devs poll this every 5s) ──────────────────────

@app.get("/all")
def all_data() -> JsonDict:
    """Get aggregated data from all modules.
    
    Combines EV, parking, petrol, RL, and road data into single response.
    Suitable for frontend dashboard polling (typically every 5s).
    """
    timestamp = _timestamp()

    return {
        "timestamp": timestamp,
        "tick": _simulation_tick,
        "health": "ok",
        "ev": {**_ev_status_payload(), "timestamp": timestamp},
        "parking": {**_parking_status_payload(), "timestamp": timestamp},
        "petrol": {**_petrol_recommendation_payload(), "timestamp": timestamp},
        "rl": _rl_action_payload().model_dump(),
        "roads": _road_payload(),
    }


# ── Root ──────────────────────────────────────────────────────────────────────

@app.get("/")
def root() -> JsonDict:
    """API root endpoint with service information."""
    return {
        "service": "UrbanHive City Mobility OS",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
