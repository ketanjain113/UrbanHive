"""Petrol pump routing recommendation module."""

from __future__ import annotations

from typing import Any

from modules.prediction_utils import exponential_smoothing_predict


def recommend_pump(
    petrol_pumps: dict[str, dict[str, Any]],
    route_congestion: dict[str, float] | None = None,
) -> dict[str, Any]:
    """Recommend the least-congested petrol pump.
    
    Scores each pump based on predicted queue length and route congestion
    multiplier. Returns the pump with lowest combined score plus alternatives.
    
    Args:
        petrol_pumps: Dictionary of pump records with keys:
            - name: Pump name
            - lat, lon: Location
            - queue: Current queue length
            - price: Fuel price
            - history: List of historical queue values
        route_congestion: Dict mapping pump_id to congestion multipliers
            (1.0 = baseline, >1.0 = more congested route)
        
    Returns:
        Recommendation dict with keys:
            - recommended_pump: Best pump ID
            - recommended_pump_name: Name of recommended pump
            - reason: Explanation for recommendation
            - scores: Detailed scores for all pumps
    """
    if not petrol_pumps:
        return {
            "recommended_pump": None,
            "reason": "No pumps available",
            "scores": {},
        }
    
    if route_congestion is None:
        route_congestion = {pid: 1.0 for pid in petrol_pumps}
    
    pump_scores = {}
    
    for pump_id, pump in petrol_pumps.items():
        history = pump.get("history", [pump.get("queue", 0)])
        predicted_queue = exponential_smoothing_predict(history, alpha=0.5)
        congestion_mult = route_congestion.get(pump_id, 1.0)
        
        # Score = predicted_queue * route_congestion_weight
        score = predicted_queue * congestion_mult
        
        pump_scores[pump_id] = {
            "name": pump.get("name", pump_id),
            "lat": pump.get("lat", 0),
            "lon": pump.get("lon", 0),
            "current_queue": pump.get("queue", 0),
            "predicted_queue": round(predicted_queue, 1),
            "congestion_mult": round(congestion_mult, 2),
            "score": round(score, 2),
            "price": pump.get("price", 0),
        }
    
    # Find best pump
    best_pump_id = min(pump_scores, key=lambda pid: pump_scores[pid]["score"])
    best_pump = pump_scores[best_pump_id]
    
    return {
        "recommended_pump": best_pump_id,
        "recommended_pump_name": best_pump["name"],
        "reason": (
            f"Lowest predicted queue ({best_pump['predicted_queue']} vehicles) "
            f"with congestion considered"
        ),
        "scores": pump_scores,
    }
