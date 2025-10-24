import React, { useState } from "react";
import PropTypes from "prop-types";
import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "../../organisms/Navbar/Navbar";
import { Sidebar } from "../../organisms/Sidebar/Sidebar";
import { useAuth } from "../../../context/AuthContext";
import "./DashboardLayout.css";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [role, setRole] = useState(user?.role || "admin");
  const [selectedScreen, setSelectedScreen] = useState(null);

  const handleScreenSelect = (screen) => {
    setSelectedScreen(screen);
    // Navigate to the corresponding route based on the screen
    switch (screen.id) {
      case "staff_vehicle":
        navigate("/vehicles");
        break;
      case "staff_warranty":
        navigate("/warranty");
        break;
      case "technician_vehicle_status":
        navigate("/technician");
        break;

      case "evm_warranty_claims":
        navigate("/evmstaff");
        break;
      default:
        navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Navbar
        role={role}
        setRole={setRole}
        toggleSidebar={toggleSidebar}
        user={user}
      />
      <div className="dashboard-container">
        {isSidebarOpen && (
          <Sidebar
            role={role}
            selectedScreen={selectedScreen}
            setSelectedScreen={handleScreenSelect}
            logout={handleLogout}
            isOpen={isSidebarOpen}
          />
        )}
        <main
          className={`dashboard-content ${
            isSidebarOpen ? "with-sidebar" : "full"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  role: PropTypes.string.isRequired,
  selectedScreen: PropTypes.object,
  setSelectedScreen: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};
