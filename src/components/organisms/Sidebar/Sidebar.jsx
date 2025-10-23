import React from 'react';
import './Sidebar.css';
import { roleScreens } from '../../../configs/roleScreen';

export const Sidebar = ({
  role,
  selectedScreen,
  setSelectedScreen,
  logout,
  isOpen = true,
}) => {
  const screens = roleScreens[role] || [];

  return (
    <aside className={`sidebar ${!isOpen ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="brand">
          <img src="/logo.png" alt="Logo" className="brand-logo" />
          <span className="brand-name">EV System</span>
        </div>
        <div className="sidebar-user">
          <div className="user-role">
            <div className="role-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-8 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v1h-16v-1z" fill="currentColor"/>
              </svg>
            </div>
            <span className="role-text">{role}</span>
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
          >
            <div className="sidebar-item-icon">
              {/* You can add specific icons for each screen here */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="sidebar-item-text">{screen.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={logout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m-5 5h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
