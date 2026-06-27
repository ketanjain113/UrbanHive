"""Mock data for UrbanHive — Indore locations and sample time-series."""

from __future__ import annotations

from modules.data_generator import generate_time_series

# ──Indore Charger Locations ──────────────────────────────────────────────────

chargers: dict[str, dict[str, object]] = {
    "CN_001": {
        "name": "Vijay Nagar Supercharger Hub",
        "lat": 22.7195,
        "lon": 75.8577,
        "load": 45,
        "capacity": 100,
        "history": generate_time_series(base_value=45, num_points=200),
    },
    "CN_002": {
        "name": "Palasia Shopping Hub Station",
        "lat": 22.7149,
        "lon": 75.8663,
        "load": 72,
        "capacity": 100,
        "history": generate_time_series(base_value=72, num_points=200),
    },
    "CN_003": {
        "name": "Bhawarkua Transit Charging",
        "lat": 22.7103,
        "lon": 75.8455,
        "load": 28,
        "capacity": 100,
        "history": generate_time_series(base_value=28, num_points=200),
    },
    "CN_004": {
        "name": "Radisson Circle Charging",
        "lat": 22.7106,
        "lon": 75.8811,
        "load": 88,
        "capacity": 100,
        "history": generate_time_series(base_value=88, num_points=200),
    },
    "CN_005": {
        "name": "Rajwada Chowk Charging",
        "lat": 22.7239,
        "lon": 75.8524,
        "load": 62,
        "capacity": 100,
        "history": generate_time_series(base_value=62, num_points=200),
    },
    "CN_006": {
        "name": "Annapurna Temple West Charging",
        "lat": 22.7258,
        "lon": 75.8396,
        "load": 35,
        "capacity": 100,
        "history": generate_time_series(base_value=35, num_points=200),
    },
}

# ── Indore Parking Lots ───────────────────────────────────────────────────────

parking_lots: dict[str, dict[str, object]] = {
    "PK_001": {
        "name": "Palasia Square Parking",
        "lat": 22.7149,
        "lon": 75.8663,
        "capacity": 150,
        "occupied": 89,
        "history": generate_time_series(base_value=89, num_points=200),
    },
    "PK_002": {
        "name": "Bypass Road Parking",
        "lat": 22.7195,
        "lon": 75.8577,
        "capacity": 200,
        "occupied": 156,
        "history": generate_time_series(base_value=156, num_points=200),
    },
    "PK_003": {
        "name": "AB Road BRTS Parking",
        "lat": 22.7106,
        "lon": 75.8811,
        "capacity": 120,
        "occupied": 34,
        "history": generate_time_series(base_value=34, num_points=200),
    },
}

# ── Indore Petrol Pumps ───────────────────────────────────────────────────────

petrol_pumps: dict[str, dict[str, object]] = {
    "PP_001": {
        "name": "Vijay Nagar Petrol Pump",
        "lat": 22.7195,
        "lon": 75.8577,
        "queue": 12,
        "price": 104.56,
        "history": generate_time_series(base_value=12, num_points=200),
    },
    "PP_002": {
        "name": "Palasia Petrol Pump",
        "lat": 22.7149,
        "lon": 75.8663,
        "queue": 8,
        "price": 104.49,
        "history": generate_time_series(base_value=8, num_points=200),
    },
    "PP_003": {
        "name": "AB Road Petrol Pump",
        "lat": 22.7106,
        "lon": 75.8811,
        "queue": 25,
        "price": 104.62,
        "history": generate_time_series(base_value=25, num_points=200),
    },
}

# ── Route Congestion Multipliers (relative to pump queue) ──────────────────────

route_congestion: dict[str, float] = {
    "PP_001": 1.0,
    "PP_002": 0.8,
    "PP_003": 1.5,
}

# ── Road segments with congestion state ────────────────────────────────────────

roads: dict[str, dict[str, object]] = {
    "RD_001": {
        "name": "AB Road BRTS",
        "coords": [[22.7196, 75.8577], [22.7150, 75.8650], [22.7106, 75.8811]],
        "speed_kmh": 28,
        "congestion": "moderate",
    },
    "RD_002": {
        "name": "Vijay Nagar Main",
        "coords": [[22.7195, 75.8577], [22.7210, 75.8540], [22.7230, 75.8510]],
        "speed_kmh": 42,
        "congestion": "free",
    },
    "RD_003": {
        "name": "Palasia to Rajwada",
        "coords": [[22.7149, 75.8663], [22.7180, 75.8600], [22.7239, 75.8524]],
        "speed_kmh": 15,
        "congestion": "heavy",
    },
    "RD_004": {
        "name": "Bypass Road",
        "coords": [[22.7300, 75.8900], [22.7250, 75.8750], [22.7195, 75.8577]],
        "speed_kmh": 55,
        "congestion": "free",
    },
    "RD_005": {
        "name": "Ring Road South",
        "coords": [[22.6950, 75.8400], [22.7000, 75.8500], [22.7050, 75.8577]],
        "speed_kmh": 50,
        "congestion": "free",
    },
}
