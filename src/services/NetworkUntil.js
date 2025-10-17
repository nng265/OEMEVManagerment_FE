// src/services/NetworkUntil.js
const API_URL = "http://localhost:3001";
const API_BASE_URL = "https://maximum-glorious-ladybird.ngrok-free.app/api";

export const ApiEnum = {
  LOGIN: { path: "/auth/login", method: "POST" },
  GET_FUNCTIONS: { path: "/functions", method: "GET" },
  GET_WARRANTY_RECORD: { path: "/warranty-record", method: "GET" },
  GET_VEHICLES: { path: "/vehicle", method: "GET" },
  GET_WORK_ORDERS: { path: "/WorkOrder", method: "GET" },
  UPDATE_WORK_ORDER: { path: "/WorkOrder", method: "PUT" },
  GET_PART_CATEGORIES: { path: "/Part/category", method: "GET" },
  GET_PART_MODELS: { path: "/Part/model", method: "GET" },
  CREATE_PART_ORDER: { path: "/PartOrder", method: "POST" },
  CREATE_PART_ORDER_ITEM: { path: "/PartOrderItem", method: "POST" },
  UPLOAD_IMAGE: { path: "/Image/multi", method: "POST" },
};

/**
 * @param {Object} endpoint - Định nghĩa endpoint (path + method)
 * @param {Object} [data] - Payload (query hoặc body)
 * @param {Object} [extraHeaders] - Headers bổ sung (vd: Authorization)
 */
export async function request(endpoint, data, extraHeaders = {}) {
  let url = `${API_BASE_URL}${endpoint.path}`;
  const token = localStorage.getItem("token");
  let headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...extraHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let options = {
    method: endpoint.method,
    headers,
  };

  if (endpoint.method.toUpperCase() === "GET" && data) {
    const queryString = new URLSearchParams(data).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  } else if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method.toUpperCase())
  ) {
    if (data) {
      options.body = JSON.stringify(data);
    }
  }

  return fetch(url, options)
    .then(async (response) => {
      const responseData = await response.json();
      if (!response.ok) {
        throw { responseData };
      }
      return responseData;
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw {
          success: false,
          code: 1000,
          message: "Network error. Please try again later.",
          data: null,
        };
      }
      throw error;
    });
}

// Legacy functions for backward compatibility
export async function login(username, password) {
  try {
    const res = await fetch(
      `${API_URL}/accounts?username=${encodeURIComponent(
        username
      )}&password=${encodeURIComponent(password)}`
    );
    if (!res.ok) return { success: false, message: "Network error" };
    const data = await res.json();
    return data.length > 0
      ? { success: true, user: data[0] }
      : { success: false, message: "Sai tài khoản hoặc mật khẩu" };
  } catch (err) {
    console.error("login error", err);
    return { success: false, message: "Network error" };
  }
}

export async function getVehicleByVin(vin) {
  try {
    const res = await fetch(
      `${API_URL}/vehicles?vin=${encodeURIComponent(vin)}`
    );
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
