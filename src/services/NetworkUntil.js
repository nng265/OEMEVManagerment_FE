// src/services/NetworkUntil.js
// const API_URL = "http://localhost:3001";
// const API_BASE_URL = "https://maximum-glorious-ladybird.ngrok-free.app/api"; của D

const API_BASE_URL =
  "https://overimpressibly-unsubject-mirna.ngrok-free.dev/api";

export const ApiEnum = {
  LOGIN: { path: "/auth/login", method: "POST" },
  GET_FUNCTIONS: { path: "/functions", method: "GET" },
  GET_WARRANTY_CLAIMS: { path: "/WarrantyClaim", method: "GET" },
  GET_WARRANTY_CLAIM_DETAIL: { path: "/WarrantyClaim/detail", method: "GET" },
  GET_VEHICLES: { path: "/vehicle", method: "GET" },
  CREATE_WARRANTY_CLAIM: { path: "/WarrantyClaim", method: "POST" },
  GET_TECHNICIANS: { path: "/Employee", method: "GET" },
  GET_WORK_ORDERS_BY_TECH: { path: "/workOrder/by-tech/detail", method: "GET" },
  GET_INSPECTION_ORDERS: {
    path: "/WorkOrder/by-tech/inspection",
    method: "GET",
  },
  GET_WARRANTY_CLAIMS_BY_STATUS: {
    path: "/WarrantyClaim/filter/:status",
    method: "GET",
  },
  GET_WARRANTY_STATUSES: { path: "/WarrantyClaim/status", method: "GET" },
  GET_REPAIR_ORDERS: { path: "/WorkOrder/by-tech/repair", method: "GET" },
  UPDATE_WORK_ORDER: { path: "/WorkOrder", method: "PUT" },
  GET_PART_CATEGORY: { path: "/Part/category", method: "GET" },
  GET_PART_MODEL: { path: "/Part/model", method: "GET" },
  GET_PART_SERIAL: { path: "/VehiclePart/serials", method: "GET" },
  BACK_WARRANTY_CLAIM: { path: "/BackWarrantyClaim/:claimId", method: "POST" },
  CREATE_PART_ORDER_ITEM: { path: "/PartOrderItem", method: "POST" },
  UPLOAD_IMAGE: { path: "/Image/multi", method: "POST" },
  SEND_CLAIM_TO_MANUFACTURER: {
    path: "/WarrantyClaim/:claimId/send-to-manufacturer",
    method: "PUT",
  },
  DENY_WARRANTY_CLAIM: { path: "/WarrantyClaim/:claimId/deny", method: "PUT" },
  CUSTOMER_GET_CAR: {
    path: "/WarrantyClaim/:claimId/customer-get-car",
    method: "PUT",
  },
  DONE_WARRANTY: {
    path: "/WarrantyClaim/:claimId/done-warranty",
    method: "PUT",
  },
  CAR_BACK_HOME: {
    path: "/WarrantyClaim/:claimId/car-back-home",
    method: "PUT",
  },
  CAR_BACK_CENTER: {
    path: "/WarrantyClaim/:claimId/car-back-center",
    method: "PUT",
  },
  ASSIGN_TECHNICIAN: { path: "/workOrder/:targetId", method: "POST" },
  GET_ASSIGNED_TECHNICIANS: {
    path: "/workOrder/assigned-techs/:claimId",
    method: "GET",
  },

  NEED_CONFIRM: { path: "/WarrantyClaim/need-confirm", method: "GET" },

  GET_VEHICLE_POLICIES: {
    path: "/warrantyClaim/vehicle-policies/:vin",
    method: "GET",
  },
  APPROVE_WARRANTY_CLAIM: {
    path: "/WarrantyClaim/:claimId/approve",
    method: "PUT",
  },
  DENY_WARRANTY: { path: "/WarrantyClaim/:claimId/deny", method: "PUT" },
  BACK_WARRANTY: { path: "/BackWarrantyClaim/:claimId", method: "POST" },
};

/**
 * @param {Object} endpoint - Định nghĩa endpoint (path + method)
 * @param {Object} [data] - Payload (query hoặc body)
 * @param {Object} [extraHeaders] - Headers bổ sung
 */
export async function request(endpoint, data = {}, extraHeaders = {}) {
  let url = `${API_BASE_URL}${endpoint.path}`;
  const token = localStorage.getItem("token");

  // Thay placeholder trong path nếu có (vd: /user/:id -> /user/123)
  if (data.params) {
    Object.entries(data.params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    });
    delete data.params; // tránh gửi params vào body hoặc query
  }

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extraHeaders,
  };

  const options = { method: endpoint.method, headers };

  if (endpoint.method.toUpperCase() === "GET" && Object.keys(data).length) {
    const queryString = new URLSearchParams(data).toString();
    if (queryString) url += `?${queryString}`;
  } else if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method.toUpperCase())
  ) {
    if (Object.keys(data).length) options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) throw { responseData };
    return responseData;
  } catch (error) {
    if (error instanceof TypeError) {
      throw {
        success: false,
        code: 1000,
        message: "Network error. Please try again later.",
        data: null,
      };
    }
    throw error;
  }
}

// export async function request(endpoint, data, extraHeaders = {}) {
//   let url = `${API_BASE_URL}${endpoint.path}`;
//   const token = localStorage.getItem("token");
//   let headers = {
//     "Content-Type": "application/json",
//     "ngrok-skip-browser-warning": "true",
//     ...extraHeaders,
//   };

//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   let options = {
//     method: endpoint.method,
//     headers,
//   };

//   if (endpoint.method.toUpperCase() === "GET" && data) {
//     const queryString = new URLSearchParams(data).toString();
//     if (queryString) {
//       url += `?${queryString}`;
//     }
//   } else if (
//     ["POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method.toUpperCase())
//   ) {
//     if (data) {
//       options.body = JSON.stringify(data);
//     }
//   }

//   return fetch(url, options)
//     .then(async (response) => {
//       const responseData = await response.json();
//       if (!response.ok) {
//         throw { responseData };
//       }
//       return responseData;
//     })
//     .catch((error) => {
//       if (error instanceof TypeError) {
//         throw {
//           success: false,
//           code: 1000,
//           message: "Network error. Please try again later.",
//           data: null,
//         };
//       }
//       throw error;
//     });
// }

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
