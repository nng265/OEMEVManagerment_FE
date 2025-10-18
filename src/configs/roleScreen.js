// src/configs/roleScreen.js
export const roleScreens = {
  ADMIN: [
    { id: "staff_approval", label: "Duyệt đơn", component: "StaffApproval" },
    {
      id: "technician_vehicle_status",
      label: "Cập nhật trạng thái xe",
      component: "TechnicianVehicleStatus",
    },
    { id: "manage_vehicles", label: "Quản lý xe", component: "Vehicles" },
  ],
  SC_STAFF: [
    { id: "staff_approval", label: "Duyệt đơn", component: "StaffApproval" },
  ],
  SC_TECH: [
    {
      id: "technician_vehicle_status",
      label: "Cập nhật trạng thái xe",
      component: "TechnicianVehicleStatus",
    },
  ],
};
