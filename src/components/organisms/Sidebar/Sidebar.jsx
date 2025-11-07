import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import "./Sidebar.css";
import { roleScreens } from "../../../configs/roleScreen";

// --- Icon Components ---

const IconDashboard = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);
const IconVehicle = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <path d="M14 16.5 V 19 a 2 2 0 0 1 -2 2 h -6 a 2 2 0 0 1 -2 -2 V 8.5 a 1.5 1.5 0 0 1 1.5 -1.5 h 7 A 1.5 1.5 0 0 1 14 8.5 v 2 M 16 12 h 2 a 2 2 0 0 1 2 2 v 2.5 m -1.5 0 h 0 m -6 0 h 0"></path>{" "}
    <circle cx="6.5" cy="18.5" r="1.5"></circle>{" "}
    <circle cx="16.5" cy="18.5" r="1.5"></circle>{" "}
  </svg>
);
const IconWarranty = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1 -7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1 -3 -3l6.91-6.91a6 6 0 0 1 7.94 -7.94l-3.76 3.76z"></path>{" "}
  </svg>
);
const IconParts = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <circle cx="12" cy="12" r="3"></circle>{" "}
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>{" "}
  </svg>
);
const IconInventory = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>{" "}
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>{" "}
    <line x1="12" y1="22.08" x2="12" y2="12"></line>{" "}
    <line x1="10" y1="14.33" x2="10" y2="17.66"></line>{" "}
    <line x1="14" y1="14.33" x2="14" y2="17.66"></line>{" "}
  </svg>
);
const IconDefault = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {" "}
    <path
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />{" "}
  </svg>
);

const IconCampaign = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 11l18-5v12l-18-5v8" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const IconCampaignVehicle = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="5" rx="2" ry="2" />
    <circle cx="7.5" cy="16.5" r="1.5" />
    <circle cx="16.5" cy="16.5" r="1.5" />
    <path d="M6 11V7h12v4" />
    <path d="M18 7l3-3" />
  </svg>
);

const IconTechTask = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Wrench body */}
    <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-4.6 4.6a1.5 1.5 0 0 0 2.1 2.1l4.6-4.6a4 4 0 0 0 5.6-5.6l-1.4 1.4a2 2 0 0 1-2.8 0l-.7-.7a2 2 0 0 1 0-2.8l1.4-1.4z" />
    {/* Gear/task indicator */}
    <circle cx="19" cy="19" r="1.8" />
    <path d="M19 15.8v1.5M19 21.5V23M15.8 19H14.3M23 19h-1.5" />
  </svg>
);

export const Sidebar = ({
  role,
  selectedScreen,
  setSelectedScreen, // Function to update the selected screen state in parent
  logout,
  isOpen = true, // Default to open, controlled by DashboardLayout
}) => {
  // Get screens available for the current user role
  const screens = roleScreens[role] || [];

  // Function to determine which icon to render based on screen ID
  const getScreenIcon = (screenId) => {
    switch (
      screenId?.toLowerCase() // Use lower case for robust matching
    ) {
      case "dashboard":
      case "overview":
      case "dashboardevmstaff":
        return <IconDashboard />;
      case "staff_vehicle":
        return <IconVehicle />;
      case "staff_warranty":
      case "evm_warranty_claims": // EVM staff also uses warranty icon
        return <IconWarranty />;
      case "staff_parts_request":
      case "evm_parts_list": // EVM staff parts request
        return <IconParts />;
      case "service_center_inventory": // Match the ID used in roleScreen config
      case "manufacturer_inventory": // Match the ID used in roleScreen config
        return <IconInventory />;
      case "technician_vehicle_status": // Technician Task View
        // You might want a specific icon for tasks, using default for now
        return <IconTechTask />;
      // Add cases for ADMIN roles if defined
      case "staff_approval":
      case "technician_vehicle_status_admin": // Example admin view
      case "manage_vehicles":
        // Add specific icons or use default
        return <IconDefault />;
      case "staff_campaign":
      case "evm_campaigns":
      case "campaign":
        return <IconCampaign />;

      case "staff_campaign_vehicle":
      case "status_campaign":
      case "campaignvehicle":
        return <IconCampaignVehicle />;

      default:
        return <IconDefault />; // Fallback icon
    }
  };

  return (
    // Apply 'collapsed' class based on the isOpen prop
    <aside className={`sidebar ${!isOpen ? "collapsed" : ""}`}>
      {/* Sidebar Header: Logo, Brand Name, User Role */}
      <div className="sidebar-header">
        <div className="brand">
          {/* Use SVG Logo */}
          <svg
            className="brand-logo"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="#00509D" />
            <path d="M50 15L79.3 30V70L50 85L20.7 70V30L50 15Z" fill="white" />
          </svg>
          <span className="brand-name">EV System</span>
        </div>
        <div className="sidebar-user">
          <div className="user-role">
            <div className="role-icon">
              {/* User Icon SVG */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-8 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v1h-16v-1z"
                  fill="currentColor"
                />
              </svg>
            </div>
            {/* Display the role text */}
            <span className="role-text">{role || "User"}</span>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation: List of screens */}
      <nav className="sidebar-nav">
        {screens.map((screen) => (
          <div
            key={screen.id}
            // Apply 'sidebar-item-active' class if the screen is selected
            className={`sidebar-item ${
              selectedScreen?.id === screen.id ? "sidebar-item-active" : ""
            }`}
            // Call setSelectedScreen when an item is clicked
            onClick={() => setSelectedScreen(screen)}
            // Add title attribute for tooltip, useful when sidebar is collapsed
            title={screen.label}
          >
            {/* Render the appropriate icon */}
            <div className="sidebar-item-icon">{getScreenIcon(screen.id)}</div>
            {/* Render the screen label */}
            <span className="sidebar-item-text">{screen.label}</span>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer: Logout Button */}
      <div className="sidebar-footer">
        <button className="logout-button" onClick={logout}>
          {/* Logout Icon SVG */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m-5 5h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Logout text */}
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

// Add PropTypes for better component documentation and error checking
Sidebar.propTypes = {
  role: PropTypes.string, // The role of the current user
  selectedScreen: PropTypes.object, // The currently active screen object
  setSelectedScreen: PropTypes.func.isRequired, // Function to change the active screen
  logout: PropTypes.func.isRequired, // Function to handle user logout
  isOpen: PropTypes.bool, // State controlling if the sidebar is open or collapsed
};

// Optional: Define default props if needed
// Sidebar.defaultProps = {
//   isOpen: true,
//   role: 'guest', // Example default role
// };

export default Sidebar; // Ensure default export if used as such elsewhere
