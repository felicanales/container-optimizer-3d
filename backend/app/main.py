from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import SimulationRequest, SimulationResponse
from app.services.packing import run_simulation

app = FastAPI(title="Container Optimizer 3D API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/simulate", response_model=SimulationResponse)
def simulate(payload: SimulationRequest) -> SimulationResponse:
    return run_simulation(payload)
