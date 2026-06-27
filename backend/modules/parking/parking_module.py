"""Parking occupancy and prediction module."""

from __future__ import annotations

from typing import Any

from modules.prediction_utils import linear_trend_predict


def get_parking_status(
    parking_lots: dict[str, dict[str, Any]]
) -> dict[str, dict[str, Any]]:
    """Get current and predicted parking status for all lots.
    
    Computes fill percentage, predicted future occupancy, and ETA to full.
    Useful for parking guidance systems and capacity planning.
    
    Args:
        parking_lots: Dictionary of parking lot records with keys:
            - name: Lot name
            - capacity: Max spaces
            - occupied: Current occupied spaces
            - history: List of historical occupancy values
        
    Returns:
        Dictionary mapping lot_id to status dict with keys:
            - name, lat, lon: Location info
            - capacity, occupied: Current state
            - fill_pct: Occupancy as percentage
            - predicted_fill_pct: Expected occupancy 5 steps ahead
            - eta_to_full_minutes: Estimated time until full (or None if decreasing)
            - status: One of 'full', 'high', 'moderate', 'available'
    """
    results = {}
    
    for lot_id, lot in parking_lots.items():
        history = lot.get("history", [lot.get("occupied", 0)])
        
        capacity = lot.get("capacity", 100)
        occupied = lot.get("occupied", 0)
        fill_pct = round((occupied / capacity) * 100, 1) if capacity > 0 else 0
        
        # Predict when full using linear trend
        predicted_occupied = linear_trend_predict(history, steps_ahead=5)
        predicted_fill = (predicted_occupied / capacity) * 100 if capacity > 0 else 0
        
        # Estimate ETA: if trending up, how many minutes until full?
        trend = history[-1] - history[0] if len(history) > 1 else 0
        if trend > 0:
            remaining_spaces = capacity - occupied
            minutes_to_full = (
                max(0, (remaining_spaces / trend) * 5)
                if trend > 0
                else float("inf")
            )
        else:
            minutes_to_full = float("inf")
        
        status = (
            "full" if fill_pct >= 95
            else "high" if fill_pct >= 80
            else "moderate" if fill_pct >= 50
            else "available"
        )
        
        results[lot_id] = {
            "name": lot.get("name", lot_id),
            "lat": lot.get("lat", 0),
            "lon": lot.get("lon", 0),
            "capacity": capacity,
            "occupied": occupied,
            "fill_pct": fill_pct,
            "predicted_fill_pct": round(predicted_fill, 1),
            "eta_to_full_minutes": (
                round(minutes_to_full, 0)
                if minutes_to_full != float("inf")
                else None
            ),
            "status": status,
        }
    
    return results
