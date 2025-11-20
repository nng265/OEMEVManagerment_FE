import React from "react";
import PropTypes from "prop-types";
import "./AuthLayout.css";

export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-logo">
            <h1>OEM EV Management</h1>
          </div>

          <div className="auth-main">{children}</div>

          <div className="auth-footer">
            <p>
              &copy; {new Date().getFullYear()} OEM EV Management. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
