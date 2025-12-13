import os
import requests

N8N_WEBHOOK = os.getenv("N8N_WEBHOOK_URL")

def send_to_n8n(payload: dict):
    if not N8N_WEBHOOK:
        return
    try:
        requests.post(N8N_WEBHOOK, json=payload, timeout=5)
    except Exception:
        pass
