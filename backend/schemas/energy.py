from pydantic import BaseModel
from typing import Optional

class Location(BaseModel):
    lat: float
    lng: float

class EnergyProfile(BaseModel):
    name: str
    email: Optional[str]
    monthlyConsumptionKWh: int
    monthlyCostCOP: int
    propertyType: str
    budgetCOP: Optional[str]
    operatingHours: int
    operatingDays: int
    location: Optional[Location]

class Recommendation(BaseModel):
    id: str
    providerName: str
    technology: str
    capacityKW: float
    pricePerKW: int
    upfrontCost: int
    savingsMonthly: int
    roiYears: float
