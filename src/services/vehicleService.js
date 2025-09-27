// src/services/vehicleService.js
const API_URL = "http://localhost:3001";

export async function getVehicles() {
  try {
    const res = await fetch(`${API_URL}/vehicles`);
    if (!res.ok) throw new Error("Failed to fetch vehicles");
    return await res.json();
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    return [];
  }
}
