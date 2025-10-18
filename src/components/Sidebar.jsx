import React from "react";
import "./Sidebar.css";
import { roleScreens } from "../configs/roleScreen";

export default function Sidebar({
  role,
  selectedScreen,
  setSelectedScreen,
  logout,
  username,
  isOpen = true,
}) {
  const screens = roleScreens[role] || [];

  return (
    <aside className={`sidebar ${isOpen ? "" : "collapsed"}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-user">
          <span className="role">{role}</span>
        </div>
      </div>
      {/* Navigation menu */}
      <nav className="sidebar-nav">
        {screens.map((screen) => (
          <div
            key={screen.id}
            className={`sidebar-link ${
              selectedScreen?.id === screen.id ? "active" : ""
            }`}
            onClick={() => setSelectedScreen(screen)}
          >
            {screen.label}
          </div>
        ))}
      </nav>
      {/* Logout section */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
