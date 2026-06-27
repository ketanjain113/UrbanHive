"""Synthetic data generator for rush-hour patterns."""

from __future__ import annotations

import random
from typing import Sequence


def generate_time_series(
    base_value: float = 50.0,
    num_points: int = 200,
    rush_hours: Sequence[tuple[int, int]] | None = None,
    noise_level: float = 0.1,
) -> list[float]:
    """Generate synthetic time-series with optional rush-hour patterns.
    
    Creates realistic mock data with:
    - Base value oscillation
    - Rush-hour spikes
    - Temporal smoothness (autocorrelation)
    - Gaussian noise
    
    Args:
        base_value: Baseline value to oscillate around (default 50.0)
        num_points: Number of data points to generate (default 200)
        rush_hours: List of (start_idx, end_idx) tuples for rush periods.
            Defaults to morning (40-80) and evening (160-200)
        noise_level: Standard deviation of gaussian noise as fraction of value
            (default 0.1)
        
    Returns:
        List of synthetic time-series values
    """
    if rush_hours is None:
        rush_hours = [(40, 80), (160, 200)]
    
    series: list[float] = []
    for i in range(num_points):
        value = base_value
        
        # Add rush-hour spike
        for start, end in rush_hours:
            if start <= i < end:
                spike = 1.0 + (0.5 * ((i - start) / (end - start)))
                value *= spike
                break
        
        # Add smoothness (autocorrelation with previous value)
        if series:
            value = 0.7 * value + 0.3 * series[-1]
        
        # Add gaussian noise
        noise = random.gauss(0, noise_level * value)
        value += noise
        value = max(0.0, value)
        
        series.append(value)
    
    return series
