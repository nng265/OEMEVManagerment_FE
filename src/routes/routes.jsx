import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DashboardLayout } from "../components/templates";
// import Login from "../features/auth/components/Login";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import DashboardEVMSTAFF from "../pages/DashboardEVMSTAFF.jsx";

import { CarListContainer } from "../features/scstaff/Vehicles/containers/CarListContainer.jsx";
import { WarrantyClaimListContainer } from "../features/scstaff/Warranty/containers/WarrantyClaimListContainer.jsx";
import { ServiceCenterInventoryContainer } from "../features/scstaff/Inventory/containers/ServiceCenterInventoryContainer.jsx";
import { PartsRequestContainer } from "../features/scstaff/Parts Requests/containers/PartsRequestContainer.jsx";
import CampaignListContainer from "../features/scstaff/Campaign/containers/CampaignListContainer.jsx";
import Statuscampaign from "../features/scstaff/StatusCampaign/container/CampaignListContainer.jsx";

import { TechnicianVehicleStatusContainer } from "../features/technician/containers/TechnicianVehicleStatusContainer.jsx";

import { PrivateRoute } from "./PrivateRoutes";
import { EVMStaffWarrantyListContainer } from "../features/evmstaff/Warranty/containers/EVMStaffWarrantyListContainer.jsx";
import { EVMPartsListContainer } from "../features/evmstaff/PartRequest/containers/EVMPartsListContainer.jsx";
import { EVMStaffInventoryContainer } from "../features/evmstaff/Inventory/containers/EVMStaffInventoryContainer.jsx";
import { EVMStaffCampaignContainer } from "../features/evmstaff/CampaignEVM/containers/EVMStaffCampaignContainer.jsx";
import { element } from "prop-types";

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
        path: "dashboardevmstaff",
        element: <DashboardEVMSTAFF />,
      },
      {
        path: "evm-staff/dashboard",
        element: <DashboardEVMSTAFF />,
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

      {
        path: "campaign",
        element: <CampaignListContainer />,
      },

      {
        path: "statuscampaign",
        element: <Statuscampaign />,
      },

      {
        path: "evmstaff_campaign",
        element: <EVMStaffCampaignContainer />,
      },
    ],
  },
];
