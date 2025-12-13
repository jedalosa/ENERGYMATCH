import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from client import router as client_router
from integrations import router as integrations_router

app = FastAPI(title="EnergyMatch API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check (OBLIGATORIO para Vercel)
@app.get("/")
def health():
    return {"status": "ok"}

# Routers
app.include_router(client_router, prefix="/client", tags=["Client"])
app.include_router(integrations_router, prefix="/integrations", tags=["Integrations"])

# Vercel handler
handler = Mangum(app)
