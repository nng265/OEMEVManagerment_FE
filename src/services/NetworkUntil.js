// src/services/NetworkUntil.js
const API_URL = "http://localhost:3001";

export async function login(username, password) {
  try {
    const res = await fetch(
      `${API_URL}/accounts?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    );
    if (!res.ok) return { success: false, message: "Network error" };
    const data = await res.json();
    return data.length > 0 ? { success: true, user: data[0] } : { success: false, message: "Sai tài khoản hoặc mật khẩu" };
  } catch (err) {
    console.error("login error", err);
    return { success: false, message: "Network error" };
  }
}

export async function getVehicleByVin(vin) {
  try {
    const res = await fetch(`${API_URL}/vehicles?vin=${encodeURIComponent(vin)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error("getVehicleByVin error", err);
    return null;
  }
}

export async function createClaim(claimData) {
  try {
    const res = await fetch(`${API_URL}/claims`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(claimData),
    });
    if (!res.ok) throw new Error("Failed to create claim");
    return await res.json();
  } catch (err) {
    console.error("createClaim error", err);
    throw err;
  }
}
