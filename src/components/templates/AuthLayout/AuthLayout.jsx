import React from 'react';
import PropTypes from 'prop-types';
import './AuthLayout.css';

export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-content">
          {/* Logo or branding could go here */}
          <div className="auth-logo">
            <h1>OEM EV Management</h1>
          </div>
          
          {/* Main content (login form, etc.) */}
          <div className="auth-main">
            {children}
          </div>
          
          {/* Footer */}
          <div className="auth-footer">
            <p>&copy; {new Date().getFullYear()} OEM EV Management. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired
};
