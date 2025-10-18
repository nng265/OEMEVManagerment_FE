import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoutes";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/auth/Dashboard";
import StaffApproval from "./SCStaff/StaffApproval";
import TechnicianVehicleStatus from "./SCTech/TechnicianVehicleStatus.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Trang Login công khai */}
        <Route path="/login" element={<Login />} />

        {/* Các trang cần đăng nhập */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff_approval"
          element={
            <PrivateRoute>
              <StaffApproval />
            </PrivateRoute>
          }
        />
        <Route
          path="/technician_vehicle_status"
          element={
            <PrivateRoute>
              <TechnicianVehicleStatus />
            </PrivateRoute>
          }
        />

        {/* Route không tồn tại → quay về Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
