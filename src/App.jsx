// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateWarrantyRequest from "./pages/CreateWarrantyRequest";
import AssignTechnician from "./pages/AssignTechnician";
import EvmApproval from "./pages/EvmApproval";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/create-claim"
        element={
          <RequireAuth>
            <CreateWarrantyRequest />
          </RequireAuth>
        }
      />
      <Route
        path="/assign-technician"
        element={
          <RequireAuth>
            <AssignTechnician />
          </RequireAuth>
        }
      />

      <Route
        path="/evm_approval"
        element={
          <RequireAuth>
            <EvmApproval />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
