// src/components/organisms/Navbar/Navbar.jsx
import React from "react";
import "./Navbar.css";
import { useAuth } from "../../../context/AuthContext"; // Import useAuth

// Helper function to get initials or abbreviation
const getUserAbbreviation = (username = "", role = "") => {
  if (!username && !role) return "?";
  if (username) return username.slice(0, 2).toUpperCase();
  switch (role.toLowerCase()) {
    case "sc_staff":
      return "SC";
    case "evm_staff":
      return "EVM";
    case "sc_tech":
      return "TECH";
    default:
      return role.slice(0, 2).toUpperCase();
  }
};

export const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const { user } = useAuth(); // Get user from context
  const today = new Date();
  const formattedDate = today.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const userAbbr = getUserAbbreviation(user?.username, user?.role);
  const userDisplayText = user?.username || user?.role || "User";

  return (
    <header
      className={`navbar ${
        isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
      }`}
    >
      <div className="navbar-container">
        <div className="navbar-left">
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="navbar-toggle-btn"
            aria-label="Toggle Sidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21M3 6H21M3 18H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {/* Date Display */}
          <div className="navbar-date">{formattedDate}</div>
        </div>

        <div className="navbar-right">
          {/* User Info */}
          {user && (
            <div className="navbar-user-info">
              <span className="navbar-user-icon">{userAbbr}</span>
              <span>{userDisplayText}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar; // Ensure default export if used as such
