"""
Pydantic schemas for request/response validation.

This package defines all data contracts exchanged
between frontend and backend.
"""

from .energy import (
    Location,
    EnergyProfile,
    Recommendation
)

__all__ = [
    "Location",
    "EnergyProfile",
    "Recommendation"
]

