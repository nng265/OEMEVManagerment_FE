import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../../organisms/Navbar/Navbar";
import { Sidebar } from "../../organisms/Sidebar/Sidebar";
import { useAuth } from "../../../context/AuthContext";
import { roleScreens } from "../../../configs/roleScreen";

export const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedScreen, setSelectedScreen] = useState(null);

  const getPathForScreen = useCallback((screenId) => {
    switch (screenId) {
      case "dashboard":
        return "/dashboard";
      case "dashboard_evmstaff":
        return "/dashboardevmstaff";
      case "staff_vehicle":
        return "/vehicles";
      case "staff_warranty":
        return "/warranty";
      case "staff_parts_request":
        return "/parts-request";
      case "service_center_inventory":
        return "/inventory";
      case "technician_vehicle_status":
        return "/technician";
      case "evm_warranty_claims":
        return "/evmstaff";
      case "evm_parts_list":
        return "/evmpartslist";
      case "evm_campaigns":
        return "/evmstaff_campaign";
      case "manufacturer_inventory":
        return "/evmstaff_inventory";
      case "staff_campaign":
        return "/campaign";
      case "status_campaign":
        return "/Statuscampaign";
      case "overview":
        return "/overview";
      case "staff_appointment":
        return "/appointment";
      case "policy_management":
        return "/policy_management";
      case "account_management":
        return "/account_management";
      case "accessory_evm":
        return "/accessory_evm";
        
      case "parts_management":
        return "/parts_management";
      default:
        console.warn(`No path found for screen ID: ${screenId}`);
        return null;
    }
  }, []);

  useEffect(() => {
    if (user?.role) {
      const currentPath = location.pathname;
      const availableScreens = roleScreens[user.role] || [];

      const screenForPath = availableScreens.find(
        (screen) => getPathForScreen(screen.id) === currentPath
      );

      const isDashboard = currentPath === "/dashboard" || currentPath === "/";
      setSelectedScreen(
        screenForPath ||
          (isDashboard ? { id: "dashboard", label: "Dashboard" } : null)
      );
    } else {
      setSelectedScreen(null);
    }
  }, [location.pathname, user?.role, getPathForScreen]);

  const handleSetSelectedScreen = (screen) => {
    setSelectedScreen(screen);
    const path = getPathForScreen(screen.id);
    if (path && path !== location.pathname) {
      console.log(
        `Navigating from Sidebar click to: ${path} (for screen ID: ${screen.id})`
      );
      navigate(path);
    } else if (!path) {
      console.warn(
        `No path defined for screen ID: ${screen.id}, navigation skipped.`
      );
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Sidebar
        role={user?.role}
        logout={handleLogout}
        isOpen={isSidebarOpen}
        selectedScreen={selectedScreen}
        setSelectedScreen={handleSetSelectedScreen}
      />
      <main
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
        }`}
      >
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default DashboardLayout;
