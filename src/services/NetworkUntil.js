// src/services/NetworkUntil.js
// const API_URL = "http://localhost:3001";
// const API_BASE_URL = "https://maximum-glorious-ladybird.ngrok-free.app/api"; //của D

const API_BASE_URL ="https://overimpressibly-unsubject-mirna.ngrok-free.dev/api";

export const ApiEnum = {
  LOGIN: { path: "/auth/login", method: "POST" },

  // GET_FUNCTIONS: { path: "/functions", method: "GET" },
  GET_WARRANTY_CLAIMS: { path: "/WarrantyClaim", method: "GET" },
  // GET_WARRANTY_CLAIM_DETAIL: { path: "/WarrantyClaim/detail", method: "GET" },
  GET_VEHICLES: { path: "/vehicle", method: "GET" },
  CREATE_WARRANTY_CLAIM: { path: "/WarrantyClaim", method: "POST" },
  ASSIGN_TECHNICIAN: { path: "/WarrantyClaim/:targetId/assign-techs", method: "POST" },

  GET_TECHNICIANS: { path: "/Employee", method: "GET" },

  GET_WORK_ORDERS_BY_TECH: { path: "/workOrder", method: "GET" },
  GET_INSPECTION_ORDERS: {
    path: "/WorkOrder/by-tech/inspection",
    method: "GET",
  },
  // GET_WARRANTY_CLAIMS_BY_STATUS: {
  //   path: "/WarrantyClaim/filter/:status",
  //   method: "GET",
  // },
  GET_WARRANTY_STATUSES: { path: "/WarrantyClaim/status", method: "GET" },
  GET_REPAIR_ORDERS: { path: "/WorkOrder/by-tech/repair", method: "GET" },
  // UPDATE_WORK_ORDER: { path: "/WorkOrder", method: "PUT" },
  GET_PART_CATEGORIES: { path: "/Part/categories", method: "GET" },
  GET_PART_MODELS: { path: "/Part/models", method: "GET" },
  GET_PART_CATEGORY_BY_MODEL: {
    path: "/Part/category-by-model",
    method: "GET",
  },
  GET_PART: { path: "/Part", method: "GET" },
  GET_PART_SERIAL: { path: "/VehiclePart/serials", method: "GET" },
  BACK_WARRANTY_CLAIM: { path: "/BackWarrantyClaim/:claimId", method: "POST" },
  CREATE_PART_ORDER_ITEM: { path: "/PartOrderItem", method: "POST" },
  UPLOAD_IMAGE: { path: "/Image/multi/:claimId", method: "POST" },
  SEND_CLAIM_TO_MANUFACTURER: {
    path: "/WarrantyClaim/:claimId/send-to-manufacturer",
    method: "PUT",
  },
  SUBMIT_PART_REQUEST: { path: "/PartOrderItem", method: "POST" },
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
  // ASSIGN_TECHNICIAN: { path: "/workOrder/:targetId", method: "POST" },
  GET_ASSIGNED_TECHNICIANS: {
    path: "/workOrder/assigned-techs",
    method: "GET",
  },
  DELETE_IMAGE: { path: "/Image/:imageId", method: "DELETE" },
  // NEED_CONFIRM: { path: "/WarrantyClaim/need-confirm", method: "GET" },
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
  WARRANTY_INSPECTION: {
    path: "/WarrantyClaim/:claimId/inspection",
    method: "PUT",
  },
  // SHOW_REQUEST_PARTS_EVMSTAFF: { path: "/PartOrder/evmstaff", method: "GET" },
  // SHOW_REQUEST_PARTS_SCSTAFF: { path: "/PartOrder/scstaff", method: "GET" },
  GET_REQUEST_PARTS: { path: "/PartOrder", method: "GET" },
  CONFIRM_PREPARE: { path: "/PartOrder/:orderId/confirm", method: "PUT" },
  DELIVERED_CLICK: { path: "/PartOrder/:orderId/delivery", method: "PUT" },
  UPDATE_REQUESTED_DATE: {
    path: "/PartOrder/:orderId/expected-date",
    method: "PUT",
  },
  WARRANTY_REPAIR: { path: "/WarrantyClaim/:claimId/repair", method: "PUT" },
  CONFIRM_PART_ORDER_DELIVERED: {
    path: "/PartOrder/:orderId/confirm-delivery",
    method: "PUT",
  },

  CREATE_CAMPAIGN: { path: "/Campaign", method: "POST" },
  CAMPAIGN_SCSTAFF: { path: "/Campaign", method: "GET" },
  CREATE_COMPAIGN: { path: "/Campaign", method: "POST" },
  CREATE_COMPAIGN_VEHICLE: { path: "/CampaignVehicle", method: "POST" },
  CAMPAIGNVEHICLE_STAFF: { path: "/CampaignVehicle", method: "GET" },
  CAMPAIGNVEHICLE_STAFF_REPAIRED: {
    path: "/CampaignVehicle/:id/repaired",
    method: "PUT",
  },
  CAMPAIGNVEHICLE_STAFF_DONE: {
    path: "/CampaignVehicle/:id/done",
    method: "PUT",
  },
  CAMPAIGNVEHICLE_STAFF_TECH: {
    path: "/CampaignVehicle/:id/assign-techs",
    method: "POST",
  },
  REPAIRED_CAMPAIGN_VEHICLE: {
    path: "/CampaignVehicle/:id/repaired",
    method: "PUT",
  },
  CAMPAIGN_SCSTAFF: { path: "/Campaign", method: "GET" },
  CREATE_COMPAIGN: { path: "/Campaign", method: "POST" },
  CREATE_COMPAIGN_VEHICLE: { path: "/CampaignVehicle", method: "POST" },
  CAMPAIGNVEHICLE_STAFF: { path: "/CampaignVehicle", method: "GET" },
  CAMPAIGNVEHICLE_STAFF_REPAIRED: {
    path: "/CampaignVehicle/:id/repaired",
    method: "PUT",
  },
  CAMPAIGNVEHICLE_STAFF_DONE: {
    path: "/CampaignVehicle/:id/done",
    method: "PUT",
  },
  CAMPAIGNVEHICLE_STAFF_TECH: {
    path: "/CampaignVehicle/:id/assign-techs",
    method: "POST",
  },
  CLOSE_CAMPAIGN: { path: "/Campaign/:id/close", method: "PUT" },
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

/**
 * @param {Object} endpoint - Định nghĩa endpoint (path + method)
 * @param {FormData|Object} data - FormData object hoặc object chứa files và fields
 * @param {Object} [extraHeaders] - Headers bổ sung
 */
export async function uploadFiles(endpoint, data = {}, extraHeaders = {}) {
  let url = `${API_BASE_URL}${endpoint.path}`;
  const token = localStorage.getItem("token");

  // Thay placeholder trong path nếu có (vd: /Image/multi/:warrantyId)
  if (data.params) {
    Object.entries(data.params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    });
    delete data.params;
  }

  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extraHeaders,
  };

  // Không set Content-Type khi gửi FormData, browser sẽ tự động set
  // với boundary phù hợp

  let formData;
  if (data instanceof FormData) {
    formData = data;
  } else {
    // Tạo FormData từ object nếu cần
    formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof FileList) {
        Array.from(value).forEach((file) => formData.append(key, file));
      } else if (Array.isArray(value) && value[0] instanceof File) {
        value.forEach((file) => formData.append(key, file));
      } else if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });
  }

  const options = {
    method: endpoint.method,
    headers,
    body: formData,
  };

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
