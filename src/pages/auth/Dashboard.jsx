import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/organisms/Sidebar/Sidebar";
import { Navbar } from "../../components/organisms/Navbar/Navbar";
import { WarrantyClaimListView } from "../../features/warranty/components/WarrantyClaimListView";
import { CarListView } from "../../features/car/components/CarListView";
import { TechnicianVehicleStatusContainer } from "../../features/technician/containers";
import EVMStaffWarrantyList from "../../features/warranty/components/EVMStaffWarrantyList";

import "./Dashboard.css";

// Map component names to actual components
const componentMap = {
  CarList: CarListView,
  WarrantyList: WarrantyClaimListView,
  TechnicianVehicleStatus: TechnicianVehicleStatusContainer,
  WarrantyClaimList: EVMStaffWarrantyList,
};

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const SelectedComponent =
    selectedScreen && componentMap[selectedScreen.component];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const currentRole = user?.role || "User";

  return (
    <div className="dashboard-wrapper">
      {/* Navbar */}
      <Navbar
        role={currentRole}
        setRole={() => {}}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="dashboard-container">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          role={currentRole}
          username={user?.username}
          selectedScreen={selectedScreen}
          setSelectedScreen={setSelectedScreen}
          logout={logout}
        />

        {/* Main content */}
        {/* Sửa lại class `content` để khớp với logic mới */}
        <main className={`content ${isSidebarOpen ? "with-sidebar" : "full"}`}>
          {SelectedComponent ? (
            <SelectedComponent />
          ) : (
            <div className="welcome">
              <h3>Welcome, {user?.role || "user"}</h3>
              <p>Please select a function from the left menu</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
