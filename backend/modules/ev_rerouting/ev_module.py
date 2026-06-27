"""EV charger rerouting module."""

from __future__ import annotations

from typing import Any

from modules.prediction_utils import exponential_smoothing_predict


def reroute_ev(
    charger_id: str,
    chargers: dict[str, dict[str, Any]],
    load_history: dict[str, list[float]] | None = None,
) -> dict[str, Any]:
    """Determine rerouting action for an EV charger.
    
    Uses exponential smoothing to predict future charger load and makes
    one of three decisions: redirect to less-congested charger, stay at
    current charger (moderate load), or proceed normally (low load).
    
    Args:
        charger_id: ID of the charger to check
        chargers: Dictionary of all charger records
        load_history: Optional custom load history (overrides charger history)
        
    Returns:
        Action dict with keys: action, from, to, reason
    """
    if charger_id not in chargers:
        return {
            "action": "error",
            "from": charger_id,
            "to": None,
            "reason": "Charger not found",
        }
    
    charger = chargers[charger_id]
    history = (
        load_history.get(charger_id)
        if load_history
        else charger.get("history", [])
    )
    
    if not history:
        history = [charger.get("load", 0)]
    
    predicted_load = exponential_smoothing_predict(history, alpha=0.4)
    
    if predicted_load > 85:
        # Find charger with lowest load
        best_charger = min(
            ((cid, c) for cid, c in chargers.items() if cid != charger_id),
            key=lambda x: x[1].get("load", 100),
            default=(charger_id, charger),
        )
        return {
            "action": "redirect",
            "from": charger_id,
            "to": best_charger[0],
            "reason": (
                f"High load predicted ({predicted_load:.1f}%), "
                f"redirecting to {best_charger[1].get('name')}"
            ),
        }
    elif predicted_load > 70:
        return {
            "action": "stay",
            "from": charger_id,
            "to": None,
            "reason": f"Moderate load ({predicted_load:.1f}%), station usable",
        }
    else:
        return {
            "action": "no_alternative",
            "from": charger_id,
            "to": None,
            "reason": f"Load acceptable ({predicted_load:.1f}%), proceeding",
        }
