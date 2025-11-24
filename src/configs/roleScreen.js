export const roleScreens = {
  ADMIN: [
    {
      id: "policy_management",
      label: "Policy Management",
      component: "PolicyContainer",
    },
    {
      id: "account_management",
      label: "Account Management",
      component: "AccountContainer",
    },
  ],
  SC_STAFF: [
    { id: "dashboard", label: "Dashboard" },
    { id: "staff_vehicle", label: "Vehicle", component: "CarList" },
    { id: "staff_warranty", label: "Warranty", component: "WarrantyList" },
    {
      id: "staff_parts_request",
      label: "Parts Request",
      component: "PartsRequest",
    },
    {
      id: "service_center_inventory",
      label: "Inventory",
      component: "ServiceCenterInventory",
    },
    { id: "staff_campaign", label: "Campaign", component: "Campaign" },
    {
      id: "staff_appointment",
      label: "Appointment",
      component: "AppointmentListContainer",
    },
    {
      id: "status_campaign",
      label: "CampaignVehicle",
      component: "StatusCampaign",
    },
  ],
  SC_TECH: [
    {
      id: "overview",
      label: "Overview",
      component: "Overview",
    },
    {
      id: "technician_vehicle_status",
      label: "Task",
      component: "TechnicianVehicleStatus",
    },
  ],
  EVM_STAFF: [
    {
      id: "dashboard_evmstaff",
      label: "Dashboard",
      component: "DashboardEVMSTAFF",
    },
    {
      id: "evm_warranty_claims",
      label: "Warranty",
      component: "WarrantyClaimList",
    },
    { id: "evm_parts_list", label: "Parts Request", component: "EVMPartsList" },
    {
      id: "manufacturer_inventory",
      label: "Inventory",
      component: "ManufacturerInventory",
    },
    { id: "evm_campaigns", label: "Campaign", component: "EVMStaffCampaign" },
    { id: "accessory_evm", label: "Accessory", component: "EVMAccessory" },
  ],
};
