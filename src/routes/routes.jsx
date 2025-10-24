import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DashboardLayout } from "../components/templates";
import Login from "../features/auth/components/Login";
import Dashboard from "../features/auth/components/Dashboard";
import { CarListContainer } from "../features/car/containers";
import { TechnicianVehicleStatusContainer } from "../features/technician/containers";
import { WarrantyClaimListContainer } from "../features/warranty/containers";
import { PrivateRoute } from "./PrivateRoutes";
import EVMStaffWarrantyListContainer from "../features/evmstaff/containers/EVMStaffWarrantyListContainer";

// Public routes that don't require authentication
export const publicRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
];

// Private routes that require authentication
export const privateRoutes = [
  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </PrivateRoute>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "vehicles",
        element: <CarListContainer />,
      },
      {
        path: "technician",
        element: <TechnicianVehicleStatusContainer />,
      },
      {
        path: "warranty",
        element: <WarrantyClaimListContainer />,
      },

      {
        path: "evmstaff",
        element: <EVMStaffWarrantyListContainer />,
      },
    ],
  },
];
