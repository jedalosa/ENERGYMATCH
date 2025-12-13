"""
Service layer for the application.

This package contains all business logic and integrations.
It must remain framework-agnostic (no FastAPI, no HTTP concerns).
"""

from .bill_analysis import analyze_bill
from .recommendation_engine import generate_recommendations
from .n8n import send_to_n8n

__all__ = [
    "analyze_bill",
    "generate_recommendations",
    "send_to_n8n"
]
