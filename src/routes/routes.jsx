import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DashboardLayout } from "../components/templates";
// import Login from "../features/auth/components/Login";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import { CarListContainer ,WarrantyClaimListContainer, ServiceCenterInventoryContainer, PartsRequestContainer} from "../features/scstaff/containers";
import { TechnicianVehicleStatusContainer } from "../features/technician/containers";
// import { WarrantyClaimListContainer } from "../features/sc/containers";
import { PrivateRoute } from "./PrivateRoutes";
import EVMStaffWarrantyListContainer from "../features/evmstaff/containers/EVMStaffWarrantyListContainer";
import { EVMPartsListContainer } from "../features/evmstaff/containers/EVMPartsListContainer";
// import { PartsRequestContainer } from "../features/scstaff/containers";
// import { ServiceCenterInventoryContainer } from "../features/servicecenter/containers/ServiceCenterInventoryContainer";
import { EVMStaffInventoryContainer } from "../features/evmstaff/containers/EVMStaffInventoryContainer";

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

      {
        path: "evmpartslist",
        element: <EVMPartsListContainer />,
      },

      {
        path: "parts-request",
        element: <PartsRequestContainer />,
      },

      {
        path: "inventory",
        element: <ServiceCenterInventoryContainer />,
      },

      {
        path: "evmstaff_inventory",
        element: <EVMStaffInventoryContainer />,
      },
    ],
  },
];
