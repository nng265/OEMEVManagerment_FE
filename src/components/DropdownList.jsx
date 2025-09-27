// src/components/DropdownList.jsx
import React from "react";
import "./DropdownList.css";

export default function DropdownList({ options, value, onChange }) {
  return (
    <select value={value} onChange={onChange} className="dropdown-list">
      <option value="">-- Chọn --</option>
      {options.map((opt, idx) => {
        if (typeof opt === "string") {
          return (
            <option key={idx} value={opt}>
              {opt}
            </option>
          );
        } else if (typeof opt === "object" && opt.value !== undefined) {
          return (
            <option key={idx} value={opt.value}>
              {opt.label || opt.value}
            </option>
          );
        }
        return null; // nếu option không hợp lệ thì bỏ qua
      })}
    </select>
  );
}
