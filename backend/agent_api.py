"""FastAPI wrapper for stateless RL traffic-signal inference."""

from __future__ import annotations

import os
from functools import lru_cache

import numpy as np
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from stable_baselines3 import PPO


MODEL_PATH = os.path.join(os.path.dirname(__file__), "ppo_traffic_agent.zip")

app = FastAPI(title="UrbanHive RL Agent", version="1.0.0")


class ActionResponse(BaseModel):
    phase: int


def _parse_queues(queues: str) -> np.ndarray:
    try:
        values = [float(part.strip()) for part in queues.split(",") if part.strip()]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="queues must be a comma-separated list of numbers") from exc

    if not values:
        raise HTTPException(status_code=400, detail="queues cannot be empty")

    queues_array = np.asarray(values, dtype=np.float32)
    return np.clip(queues_array / 50.0, 0.0, 1.0)


@lru_cache(maxsize=1)
def _load_model() -> PPO:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(MODEL_PATH)
    return PPO.load(MODEL_PATH)


@app.get("/rl/status")
def rl_status() -> dict[str, object]:
    model_loaded = os.path.exists(MODEL_PATH)
    return {"model": "ppo_traffic_agent", "loaded": model_loaded}


@app.get("/rl/action", response_model=ActionResponse)
def rl_action(queues: str = Query(..., description="Comma-separated queue lengths")) -> ActionResponse:
    try:
        model = _load_model()
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="PPO model not found. Train the agent before requesting actions.")

    observation = _parse_queues(queues)
    action, _ = model.predict(observation, deterministic=True)
    return ActionResponse(phase=int(action))


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "UrbanHive RL Agent", "status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
