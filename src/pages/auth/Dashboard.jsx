import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

// Import các component tương ứng
import StaffApproval from "../../SCStaff/StaffApproval";
import TechnicianVehicleStatus from "../../SCTech/TechnicianVehicleStatus";

import "./Dashboard.css";

// Map tên component từ roleScreens sang component thực tế
const componentMap = {
  StaffApproval,
  TechnicianVehicleStatus,
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const SelectedComponent =
    selectedScreen && componentMap[selectedScreen.component];

  // Toggle sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Role hiện tại (chuyển về lowercase để đồng bộ key)
  const currentRole = user?.role || "User";

  return (
    <div className="dashboard-wrapper">
      {/* Navbar */}
      <Navbar
        role={currentRole}
        setRole={() => {}}
        toggleSidebar={toggleSidebar}
      />

      <div className="dashboard-container">
        {/* Sidebar */}
        {isSidebarOpen && (
          <Sidebar
            role={currentRole}
            username={user?.username}
            selectedScreen={selectedScreen}
            setSelectedScreen={setSelectedScreen}
            logout={logout}
          />
        )}

        {/* Main content */}
        <main className={`content ${isSidebarOpen ? "with-sidebar" : "full"}`}>
          {SelectedComponent ? (
            <SelectedComponent />
          ) : (
            <div className="welcome">
              <h3>Chào mừng, {user?.role || "người dùng"}</h3>
              <p>Hãy chọn chức năng từ menu bên trái</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
