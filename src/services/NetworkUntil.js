// src/services/NetworkUntil.js
// const API_URL = "http://localhost:3001";
const API_BASE_URL = "https://maximum-glorious-ladybird.ngrok-free.app/api";

export const ApiEnum = {
  LOGIN: { path: "/auth/login", method: "POST" },
  GET_FUNCTIONS: { path: "/functions", method: "GET" },
  GET_WARRANTY_RECORD: { path: "/warranty-record", method: "GET" },
  GET_WARRANTY_CLAIMS: { path: "/WarrantyClaim", method: "GET" },
  GET_VEHICLES: { path: "/vehicle", method: "GET" },
  GET_WORK_ORDERS_BY_TECH: { path: "/WorkOrder/by-tech", method: "GET" },
  GET_INSPECTION_ORDERS: {
    path: "/WorkOrder/by-tech/inspection",
    method: "GET",
  },
  GET_REPAIR_ORDERS: { path: "/WorkOrder/by-tech/repair", method: "GET" },
  UPDATE_WORK_ORDER: { path: "/WorkOrder", method: "PUT" },
  GET_PART_CATEGORY: { path: "/Part/category", method: "GET" },
  GET_PART_MODEL: { path: "/Part/model", method: "GET" },
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

// /// ------------- VÍ DỤ --------------

// (async () => {
//   try {
//     const res = await request(ApiEnum.LOGIN, {
//       username: "admin",
//       password: "admin",
//     });
//     console.log("Login:", res);
//   } catch (err) {
//     console.error("Login error:", err);
//   }
// })();

// (async () => {
//   try {
//     const token =
//       "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwaHVjYW4xIiwiaWF0IjoxNzU1NTkyNzA0LCJleHAiOjE3NTU1OTc4ODh9.hffFEDVMSQDylX0VPcwchG10EY79yMRMtwF7Fa8YwKBRsXefdVjuD_0gVPpyAVbTP_zmKpP-J0fr_8pEve2SUA";
//     const res = await request(ApiEnum.GET_FUNCTIONS, null, {
//       Authorization: `Bearer ${token}`,
//     });
//     console.log("Functions:", res);
//   } catch (err) {
//     console.error("Functions error:", err);
//   }
// })();

// (async () => {
//   try {
//     const token =
//       "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwaHVjYW4xIiwiaWF0IjoxNzU1NTkyNzA0LCJleHAiOjE3NTU1OTc4ODh9.hffFEDVMSQDylX0VPcwchG10EY79yMRMtwF7Fa8YwKBRsXefdVjuD_0gVPpyAVbTP_zmKpP-J0fr_8pEve2SUA";
//     const res = await request(
//       ApiEnum.GET_FUNCTIONS,
//       { role: `admin` },
//       {
//         Authorization: `Bearer ${token}`,
//       }
//     );
//     console.log("Functions with role:", res);
//   } catch (err) {
//     console.error("Functions error:", err);
//   }
// })();
