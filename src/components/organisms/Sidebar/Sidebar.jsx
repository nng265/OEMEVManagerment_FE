import React from "react";
import PropTypes from "prop-types";
import "./Sidebar.css";
import { roleScreens } from "../../../configs/roleScreen";

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
    <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-4.6 4.6a1.5 1.5 0 0 0 2.1 2.1l4.6-4.6a4 4 0 0 0 5.6-5.6l-1.4 1.4a2 2 0 0 1-2.8 0l-.7-.7a2 2 0 0 1 0-2.8l1.4-1.4z" />
    <circle cx="19" cy="19" r="1.8" />
    <path d="M19 15.8v1.5M19 21.5V23M15.8 19H14.3M23 19h-1.5" />
  </svg>
);
const IconPolicy = () => (
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
    <path d="M12 2l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V6l7-4z" />

    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconAppointment = () => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export const Sidebar = ({
  role,
  selectedScreen,
  setSelectedScreen,
  logout,
  isOpen = true,
}) => {
  const screens = roleScreens[role] || [];

  const getScreenIcon = (screenId) => {
    switch (screenId?.toLowerCase()) {
      case "dashboard":
      case "overview":
      case "dashboardevmstaff":
        return <IconDashboard />;
      case "staff_vehicle":
        return <IconVehicle />;
      case "staff_warranty":
      case "evm_warranty_claims":
        return <IconWarranty />;
      case "staff_parts_request":
      case "evm_parts_list":
        return <IconParts />;
      case "service_center_inventory":
      case "manufacturer_inventory":
        return <IconInventory />;
      case "technician_vehicle_status":
        return <IconTechTask />;
      case "staff_approval":
      case "technician_vehicle_status_admin":
      case "manage_vehicles":
        return <IconDefault />;
      case "staff_campaign":
      case "evm_campaigns":
      case "campaign":
        return <IconCampaign />;
      case "staff_campaign_vehicle":
      case "status_campaign":
      case "campaignvehicle":
        return <IconCampaignVehicle />;
      case "staff_appointment":
        return <IconAppointment />;
      case "policy_management":
        return <IconPolicy />;
      default:
        return <IconDefault />;
    }
  };

  return (
    <aside className={`sidebar ${!isOpen ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="brand">
  <img
    src="../../../../public/logo.png"
    alt="EV Logo"
    className="brand-logo"
  />
  <span className="brand-name">EV System</span>
</div>

        <div className="sidebar-user">
          <div className="user-role">
            <div className="role-icon">
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
            <span className="role-text">{role || "User"}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {screens.map((screen) => (
          <div
            key={screen.id}
            className={`sidebar-item ${
              selectedScreen?.id === screen.id ? "sidebar-item-active" : ""
            }`}
            onClick={() => setSelectedScreen(screen)}
            title={screen.label}
          >
            <div className="sidebar-item-icon">{getScreenIcon(screen.id)}</div>
            <span className="sidebar-item-text">{screen.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={logout}>
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
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  role: PropTypes.string,
  selectedScreen: PropTypes.object,
  setSelectedScreen: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

// Optional: Define default props if needed
// Sidebar.defaultProps = {
//   isOpen: true,
//   role: 'guest', // Example default role
// };

export default Sidebar;
