// src/components/InputText.jsx
import React from "react";
import "./InputText.css";

export default function InputText({ value, onChange, placeholder, readOnly = false }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className="input-text"
    />
  );
}
