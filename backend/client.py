from fastapi import APIRouter, UploadFile, File
from schemas.energy import EnergyProfile, Recommendation
from services.bill_analysis import analyze_bill
from services.recommendation_engine import generate_recommendations

router = APIRouter()

@router.post("/analyze-bill")
async def analyze_energy_bill(file: UploadFile = File(...)):
    return analyze_bill(file)

@router.post("/recommendations", response_model=list[Recommendation])
async def recommendations(profile: EnergyProfile):
    return generate_recommendations(profile)
