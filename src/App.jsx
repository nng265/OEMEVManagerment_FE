// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateWarrantyRequest from "./pages/CreateWarrantyRequest";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>}/>
      <Route path="/create-claim" element={<RequireAuth><CreateWarrantyRequest /></RequireAuth>}/>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
