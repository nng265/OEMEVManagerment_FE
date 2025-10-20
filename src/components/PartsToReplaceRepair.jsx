// src/components/PartsToReplaceRepair.jsx
import React from "react";
import "./CommonSections.css";

const PartsToReplaceRepair = ({ parts = [] }) => {
  if (!Array.isArray(parts) || parts.length === 0) {
    return <p className="no-data">No parts to replace or repair</p>;
  }

  return (
    <table className="parts-table">
      <thead>
        <tr>
          <th>Action</th>
          <th>Category</th>
          <th>Model</th>
          <th>Serial</th>
        </tr>
      </thead>
      <tbody>
        {parts.map((p, i) => (
          <tr key={p.id || i}>
            <td>{p.action || "—"}</td>
            <td>{p.category || "—"}</td>
            <td>{p.model || "—"}</td>
            <td>{p.serial || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default PartsToReplaceRepair;
