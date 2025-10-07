import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import StaffApproval from "./pages/StaffApproval";
import UpdateStatus from "./pages/UpdateStatus";
import SendToEvm from "./pages/SendToStaff";

export default function App() {
  return (
    <Routes>
      {/* Mặc định mở Dashboard */}
      <Route path="/" element={<Dashboard />} />

      {/* Các trang chức năng */}
      <Route path="/update_status" element={<UpdateStatus />} />
      <Route path="/send_update" element={<SendToEvm />} />
      <Route path="/staff_approval" element={<StaffApproval />} />

      {/* Nếu đường dẫn không tồn tại → quay về Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
