from schemas.energy import EnergyProfile

def generate_recommendations(profile: EnergyProfile):
    base_kw = profile.monthlyConsumptionKWh / 120
    price_kw = 4200000

    return [{
        "id": "rec-1",
        "providerName": "SolarCaribe Pro",
        "technology": "Solar FV",
        "capacityKW": round(base_kw, 1),
        "pricePerKW": price_kw,
        "upfrontCost": int(base_kw * price_kw),
        "savingsMonthly": int(profile.monthlyCostCOP * 0.45),
        "roiYears": 4.2
    }]
