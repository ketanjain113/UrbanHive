"""Prediction utilities for time-series forecasting."""

from __future__ import annotations

from typing import Sequence


def exponential_smoothing_predict(
    history: Sequence[float],
    alpha: float = 0.3,
    steps_ahead: int = 1,
) -> float:
    """Exponential smoothing prediction for univariate time series.
    
    Simple exponential smoothing with weighted average of historical values.
    Higher alpha gives more weight to recent observations.
    
    Args:
        history: Time-series values (numeric sequence)
        alpha: Smoothing factor (0 <= alpha <= 1), default 0.3
        steps_ahead: How many steps into future to predict (for multi-step)
        
    Returns:
        Predicted next value as float
    """
    if not history:
        return 0.0
    
    alpha = max(0.0, min(1.0, alpha))
    
    # Simple exponential smoothing
    S = float(history[0])
    for i in range(1, len(history)):
        S = alpha * float(history[i]) + (1 - alpha) * S
    
    return S


def linear_trend_predict(
    history: Sequence[float],
    steps_ahead: int = 1,
) -> float:
    """Linear regression trend prediction for univariate time series.
    
    Fits a line to historical data using least-squares method and
    extrapolates into the future.
    
    Args:
        history: Time-series values (numeric sequence)
        steps_ahead: How many steps into future to predict
        
    Returns:
        Predicted value as float
    """
    if not history:
        return 0.0
    
    if len(history) < 2:
        return float(history[-1])
    
    # Fit line to history using least-squares
    n = len(history)
    x_vals = list(range(n))
    y_vals = [float(v) for v in history]
    
    x_mean = sum(x_vals) / n
    y_mean = sum(y_vals) / n
    
    numerator = sum((x_vals[i] - x_mean) * (y_vals[i] - y_mean) for i in range(n))
    denominator = sum((x_vals[i] - x_mean) ** 2 for i in range(n))
    
    if denominator == 0:
        return y_mean
    
    slope = numerator / denominator
    intercept = y_mean - slope * x_mean
    
    # Predict at future step
    future_x = n - 1 + steps_ahead
    return slope * future_x + intercept
