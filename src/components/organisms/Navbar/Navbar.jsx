import React from 'react';
import Input from '../../atoms/Input/Input';
import './Navbar.css';

export const Navbar = ({ role, setRole, toggleSidebar, user, isSidebarOpen }) => {
  return (
    <header className={`navbar ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      <div className="navbar-container">
        {/* 
        <div className="navbar-left">
          <button onClick={toggleSidebar} className="navbar-toggle-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <h1 className="navbar-title">OEM EV Management</h1>
        </div>

        <div className="navbar-right">
          <div className="navbar-role-selector">
            <Input
              type="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: "admin", label: "Admin" },
                { value: "sc staff", label: "SC Staff" },
                { value: "sc technican", label: "SC Technican" },
              ]}
              className="role-dropdown"
            />
          </div>
          <div className="navbar-user">
            <div className="user-avatar">
              <span>NA</span>
            </div>
          </div>
        </div>
        */}
      </div>
    </header>
  );
};