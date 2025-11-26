import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DashboardLayout } from "../components/templates";
import { element } from "prop-types";

import Login from "../pages/Login.jsx";
import Home from "../pages/Home.jsx";
import CusAppointmentForm from "../pages/CusAppointmentForm.jsx";
import ConfirmAppointment from "../pages/ConfirmAppointment.jsx";

import Dashboard from "../pages/Dashboard.jsx";
import DashboardEVMSTAFF from "../pages/DashboardEVMSTAFF.jsx";
import { RoleBasedRedirect } from "./RoleBasedRedirect.jsx";
import { CarListContainer } from "../features/scstaff/Vehicles/containers/CarListContainer.jsx";
import { WarrantyClaimListContainer } from "../features/scstaff/Warranty/containers/WarrantyClaimListContainer.jsx";
import { ServiceCenterInventoryContainer } from "../features/scstaff/Inventory/containers/ServiceCenterInventoryContainer.jsx";
import { PartsRequestContainer } from "../features/scstaff/Parts Requests/containers/PartsRequestContainer.jsx";
import CampaignListContainer from "../features/scstaff/Campaign/containers/CampaignListContainer.jsx";
import Statuscampaign from "../features/scstaff/StatusCampaign/container/CampaignListContainer.jsx";
import { AppointmentListContainer } from "../features/scstaff/Appointment/containers/AppointmentListContainer.jsx";
import { TechnicianVehicleStatusContainer } from "../features/technician/containers/TechnicianVehicleStatusContainer.jsx";
import { PrivateRoute } from "./PrivateRoutes";
import { EVMStaffWarrantyListContainer } from "../features/evmstaff/Warranty/containers/EVMStaffWarrantyListContainer.jsx";
import { EVMPartsListContainer } from "../features/evmstaff/PartRequest/containers/EVMPartsListContainer.jsx";
import { EVMStaffInventoryContainer } from "../features/evmstaff/Inventory/containers/EVMStaffInventoryContainer.jsx";
import { EVMStaffCampaignContainer } from "../features/evmstaff/CampaignEVM/containers/EVMStaffCampaignContainer.jsx";
import CampaignDetailPage from "../features/evmstaff/CampaignEVM/components/CampaignDetailPage.jsx";
import OverViewContainer from "../features/dashboard/containers/OverViewContainer.jsx";
import PolicyContainers from "../features/admin/policy/containers/PolicyContainer.jsx";
import AccountContainers from "../features/admin/account/containers/AccountContainer.jsx";
import { PartContainer } from "../features/admin/parts/containers/PartContainer.jsx";
import AccessoryListContainer from "../features/admin/Accessory/containers/AccessoryListContainer.jsx"
import AccessoryScStaffContainer from "../features/scstaff/Accessory/containers/AccessoryListContainer.jsx"
import AccessoryEvmStaffContainer from "../features/evmstaff/Accessory/containers/AccessoryListContainer.jsx"

export const publicRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/cusappointmentform",
    element: <CusAppointmentForm />,
  },
  {
    path: "/confirmappointment",
    element: <ConfirmAppointment />,
  },
];

// dinh nghia cac route cho nguoi dung da dang nhap
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
        element: <RoleBasedRedirect />,
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
        path: "overview",
        element: <OverViewContainer />,
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
        path: "appointment",
        element: <AppointmentListContainer />,
      },

      {
        path: "evmstaff_campaign",
        element: <EVMStaffCampaignContainer />,
      },

      {
        path: "evmstaff_campaign/:id",
        element: <CampaignDetailPage />,
      },

      {
        path: "policy_management",
        element: <PolicyContainers />,
      },

      {
        path: "account_management",
        element: <AccountContainers />,
      },
      {
        path: "parts_management",
        element: <PartContainer />,
      },

      {
        path: "accessory_admin",
        element: <AccessoryListContainer />
      },

      {
        path: "accessory_scstaff",
        element: <AccessoryScStaffContainer />
      },

      {
        path: "accessory_evmstaff",
        element: <AccessoryEvmStaffContainer />
      },

    ],
  },
];
