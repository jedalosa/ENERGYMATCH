from fastapi import APIRouter
from services.n8n import send_to_n8n

router = APIRouter()

@router.post("/n8n/lead")
async def send_lead(payload: dict):
    send_to_n8n(payload)
    return {"status": "sent"}
