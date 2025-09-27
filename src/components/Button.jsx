// src/components/Button.jsx
import React from "react";
import "./Button.css";

export default function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button type={type} onClick={onClick} className={`btn-custom ${className}`}>
      {children}
    </button>
  );
}
