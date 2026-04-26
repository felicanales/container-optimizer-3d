import type { SimulationRequest, SimulationResponse } from "@/types/simulation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function runSimulation(payload: SimulationRequest): Promise<SimulationResponse> {
  const response = await fetch(`${API_BASE_URL}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo ejecutar la simulacion.");
  }

  return response.json();
}
