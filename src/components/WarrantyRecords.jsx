// src/components/WarrantyRecords.jsx
import React from "react";
import "./CommonSections.css";

const WarrantyRecords = ({ records = [] }) => (
  <div className="section-container">
    <h4 className="section-title">Warranty Records</h4>
    <div className="warranty-records-list">
      {records.length > 0 ? (
        records.map((r, i) => (
          <div key={i} className="record-item">
            <span className="record-icon">📜</span>
            <div>
              <p className="record-name">{r.name}</p>
              <p className="record-date">
                {r.startDate} - {r.endDate}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="section-text">No warranty records found.</p>
      )}
    </div>
  </div>
);

export default WarrantyRecords;
