from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
def provider_dashboard():
    return {
        "leads": 24,
        "rating": 4.8,
        "activeProjects": 8
    }
