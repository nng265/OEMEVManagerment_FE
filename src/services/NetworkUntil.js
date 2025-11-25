const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_D;

export const ApiEnum = {
  LOGIN: { path: "/auth/login", method: "POST" },
  LOGIN_GOOGLE: { path: "/auth/google-login", method: "POST" },

  // ===== Dashboard (SC) =====
  GET_DASHBOARD_SC_SUMMARY: { path: "/Dashboard/sc/summary", method: "GET" },
  // ===== Dashboard (EVM) =====
  GET_DASHBOARD_EVM_SUMMARY: { path: "/Dashboard/evm/summary", method: "GET" },

  // — EVM Metrics (Dashboard widgets)
  API_GET_TOTAL_WARRANTY_CLAIMS: {
    path: "/WarrantyClaim/count/sent-to-manufacturer",
    method: "GET",
  },
  API_GET_TOTAL_PARTS_REQUESTS: { path: "/PartOrder/count", method: "GET" },
  API_GET_ACTIVE_CAMPAIGNS_COUNT: { path: "/Campaign/count", method: "GET" },
  API_GET_CAMPAIGN_PARTICIPATION: {
    path: "/Campaign/participation-aggregate",
    method: "GET",
  },
  API_GET_WARRANTY_CLAIMS_TREND: {
    path: "/WarrantyClaim/counts",
    method: "GET",
  },
  API_GET_TOP_WARRANTY_POLICIES: {
    path: "/WarrantyClaim/top-policies",
    method: "GET",
  },
  API_GET_PARTS_REQUEST_RANKING: {
    path: "/PartOrder/top-requested-parts",
    method: "GET",
  },
  API_GET_WARRANTY_BY_SERVICE_CENTER: {
    path: "/WarrantyClaim/top-service-centers",
    method: "GET",
  },

  // ===== Warranty Claims =====
  GET_WARRANTY_CLAIMS: { path: "/WarrantyClaim", method: "GET" },
  CREATE_WARRANTY_CLAIM: { path: "/WarrantyClaim", method: "POST" },
  ASSIGN_TECHNICIAN: {
    path: "/WarrantyClaim/:targetId/assign-techs",
    method: "POST",
  },

  // ===== Employees / Technicians =====
  GET_TECHNICIANS: { path: "/Employee", method: "GET" },

  // ===== Technician Tasks (Work Orders) =====
  GET_WORK_ORDERS_BY_TECH: { path: "/workOrder", method: "GET" },
  GET_WORK_ORDER_TASK_COUNTS: { path: "/WorkOrder/task-counts", method: "GET" },
  GET_WORK_ORDER_TASK_GROUP_COUNTS: {
    path: "/WorkOrder/task-group-counts",
    method: "GET",
  },
  GET_INSPECTION_ORDERS: {
    path: "/WorkOrder/by-tech/inspection",
    method: "GET",
  },

  GET_WARRANTY_STATUSES: { path: "/WarrantyClaim/status", method: "GET" },
  GET_REPAIR_ORDERS: { path: "/WorkOrder/by-tech/repair", method: "GET" },

  // ===== Inventory / Parts Catalog =====
  GET_PART_CATEGORIES: { path: "/Part/categories", method: "GET" },
  GET_PART_MODELS: { path: "/Part/models", method: "GET" },
  GET_PART_CATEGORY_BY_MODEL: {
    path: "/Part/category-by-model",
    method: "GET",
  },
  GET_PART: { path: "/Part", method: "GET" },
  GET_PART_SERIAL: { path: "/VehiclePartHistory/serials", method: "GET" },

  // ===== Warranty Claim Actions =====
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
  WARRANTY_DENIAL_REASONS: {
    path: "/WarrantyClaim/denial-reasons",
    method: "GET",
  },
  DENY_WARRANTY_CLAIM: {
    path: "/WarrantyClaim/:claimId/deny",
    method: "PUT",
  },



  // ===== Assignments / People =====
  GET_ASSIGNED_TECHNICIANS: {
    path: "/workOrder/assigned-techs",
    method: "GET",
  },

  // ===== Images =====
  DELETE_IMAGE: { path: "/Image/:imageId", method: "DELETE" },

  // ===== Vehicles =====
  GET_VEHICLES: { path: "/vehicle", method: "GET" },
  GET_VEHICLE_POLICIES: {
    path: "/warrantyClaim/vehicle-policies/:vin",
    method: "GET",
  },

  // ===== Warranty Processing =====
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
  GET_REQUEST_PARTS: { path: "/PartOrder", method: "GET" },

  // ===== Parts Requests (Orders) =====
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

  // ===== Campaigns =====
  CREATE_CAMPAIGN: { path: "/Campaign", method: "POST" },
  CAMPAIGN_SCSTAFF: { path: "/Campaign", method: "GET" },
  CAMPAIGN_VEHICLE_STATUSES: {
    path: "/Campaign/:id/vehicle-statuses",
    method: "GET",
  },
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

  GET_CAMPAIGN_VEHICLE_STATUSES: {
    path: "/CampaignVehicle/statuses",
    method: "GET",
  },
  CLOSE_CAMPAIGN: { path: "/Campaign/:id/close", method: "PUT" },

  // ===== Organization =====
  ORGANIZATION: { path: "/Organization", method: "GET" },

  // ===== Appointments =====
  APPOINTMENT: { path: "/Appointment", method: "GET" },
  APPOINTMENT_TIMESLOTS: {
    path: "/Appointment/available-timeslots",
    method: "GET",
  },
  APPOINTMENT_CREATE_CUS: { path: "/Appointment", method: "POST" },
  APPOINTMENT_CREATE: { path: "/Appointment/evm", method: "POST" },

  APPOINTMENT_CONFIRM: {
    path: "/Appointment/:appointmentId/confirm",
    method: "PUT",
  },
  Appointment_CHECKIN: {
    path: "/Appointment/:appointmentId/check-in",
    method: "PUT",
  },
  Appointment_NOSHOW: {
    path: "/Appointment/:appointmentId/no-show",
    method: "PUT",
  },
  Appointment_RESCHEDULE: {
    path: "/Appointment/:appointmentId/reschedule",
    method: "PUT",
  },
  Appointment_DONE: { path: "/Appointment/:appointmentId/done", method: "PUT" },
  Appointment_CANCEL: {
    path: "/Appointment/:appointmentId/cancel",
    method: "PUT",
  },

  // ===== Policy Management =====
  POLICY_MANAGEMENT: { path: "/WarrantyPolicy", method: "GET" },
  CREATE_POLICY: { path: "/WarrantyPolicy", method: "POST" },
  UPDATE_POLICY: { path: "/WarrantyPolicy/:id", method: "PUT" },
  DEACTIVATE_POLICY: {
    path: "/WarrantyPolicy/deactivatePolicy/:id",
    method: "PATCH",
  },
  DELETE_POLICY: { path: "/WarrantyPolicy/:id", method: "DELETE" },

  // ===== Account Management =====
  ACCOUNT_MANAGEMENT: { path: "/Employee/accounts", method: "GET" },
  CREATE_ACCOUNT: { path: "/Employee/createAccount", method: "POST" },
  UPDATE_ACCOUNT: { path: "/Employee/updateAccount/:id", method: "PUT" },
  DELETE_ACCOUNT: { path: "/Employee/deleteAccount/:id", method: "DELETE" },

  // ===== Accessory  =====
// ===== Accessory  =====
  GET_PART_HISTORY: { path: "/VehiclePartHistory", method: "GET" },
  GET_PART_STATUS: { path: "/VehiclePartHistory/statuses", method: "GET" },
  GET_PART_CONDITION: { path: "/VehiclePartHistory/conditions", method: "GET" },
  // ==== Admin Parts Request =====
  PART_ORDER_STATUSES: { path: "/PartOrder/statuses", method: "GET" },
  GET_REASON: { path: "/PartOrder/return-reasons", method: "GET" },
  GET_CANCEL: { path: "/PartOrder/cancellation-reasons", method: "GET" },
  GET_PART_ORDERS: { path: "/PartOrder/:orderID", method: "GET" },
  CANCEL_SHIPEMENT: {
    path: "/PartOrder/:orderID/cancel-shipment",
    method: "POST",
  },
  //=== DISCREPANCY
  RESOLVE_DISCREPANCY_OPTIONS: {
    path: "/PartOrder/discrepancy-resolution-options",
    method: "GET",
  },
  RESOLVE_DISCREPANCY: {
    path: "/PartOrder/:orderID/resolve-discrepancy",
    method: "POST",
  },

  // === EVM Staff Parts Request =====
  CREATE_PART_ORDER_BY_EVM: {
    path: "/PartOrder/create-by-evm",
    method: "POST",
  },
  RETURN_SHIPMENT: {
    path: "/PartOrder/:orderID/return-shipment",
    method: "POST",
  },
  GET_PART_ORDER_BY_ID: { path: "/PartOrder/:orderID", method: "GET" },
};
/**
 * @param {Object} endpoint - Định nghĩa endpoint (path + method)
 * @param {Object} [data] - Payload (query hoặc body)
 * @param {Object} [extraHeaders] - Headers bổ sung
 */
export async function request(endpoint, data = {}, extraHeaders = {}) {
  let url = `${API_BASE_URL}${endpoint.path}`;
  const token = localStorage.getItem("token");

  const shouldSkipAuth = Boolean(extraHeaders.skipAuth);
  if (shouldSkipAuth) delete extraHeaders.skipAuth;

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
    ...(token && !shouldSkipAuth && { Authorization: `Bearer ${token}` }),
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
