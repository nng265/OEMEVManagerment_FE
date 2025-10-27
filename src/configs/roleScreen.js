// src/configs/roleScreen.js
export const roleScreens = {
  ADMIN: [
    {
      id: "staff_approval",
      label: "Approve Requests",
      component: "StaffApproval",
    },
    {
      id: "staff_approval",
      label: "Approve Requests",
      component: "StaffApproval",
    },
    {
      id: "technician_vehicle_status",
      label: "Update Vehicle Status",
      component: "TechnicianVehicleStatus",
    },
    { id: "manage_vehicles", label: "Manage Vehicles", component: "Vehicles" },
  ],
  SC_STAFF: [
    { id: "staff_vehicle", label: "Vehicle", component: "CarList" },
    { id: "staff_warranty", label: "Warranty", component: "WarrantyList" },
    {
      id: "staff_parts_request",
      label: "Parts Request",
      component: "PartsRequest",
    },
  ],
  SC_TECH: [
    {
      id: "technician_vehicle_status",
      label: "Task",
      component: "TechnicianVehicleStatus",
    },
  ],
  EVM_STAFF: [
    {
      id: "evm_warranty_claims",
      label: "Warranty",
      component: "WarrantyClaimList",
    },
    {
      id: "evm_parts_list",
      label: "evmpartslist",
      component: "EVMPartsList",
    },
  ],
};
