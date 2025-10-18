// src/components/Navbar.jsx
import React from "react";
import "./Navbar.css";
import DropdownList from "./DropdownList";

export default function Navbar({ role, setRole, toggleSidebar }) {
  return (
    <header className="custom-navbar">
      <div className="navbar-left-items">
        <button onClick={toggleSidebar} className="navbar-toggle-btn">
          &#9776;
        </button>
      </div>

      <div className="navbar-right-items">
        <DropdownList
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "admin", label: "Admin" },
            { value: "sc staff", label: "SC Staff" },
            { value: "sc technican", label: "SC Technican" },
          ]}
          className="role-dropdown"
        />
        <div className="user-avatar">NA</div>
      </div>
    </header>
  );
}
