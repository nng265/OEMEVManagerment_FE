// src/components/Accessory/InStock.jsx
import React from "react";
import "./AccessoryList.css";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export default function InStock({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="popup-overlay">
      <div className="popup-card instock">
        <div className="popup-header">
          <h1>In Stock</h1>
        </div>

        <div className="popup-body">
          <div className="info-row">
            <div>
              <h4>
                <strong>Detail</strong>
              </h4>
              <div style={{ marginTop: 12, marginLeft: 24 }}>Serial: {item.serialNumber}</div>
              <div style={{ marginTop: 6, marginLeft: 24 }}>Model: {item.model}</div>
              <div style={{ marginTop: 6, marginLeft: 24 }}>Condition: {item.condition}</div>
              <div style={{ marginTop: 6, marginLeft: 24 }}>Warranty Period: {item.warrantyPeriodMonths}</div>
              <div style={{ marginTop: 6, marginLeft: 24 }}>Note: {item.note}</div>
            </div>
          </div>
          <div className="info-row">
            <div className="parent-container">
              <h4>
                <strong>Time Line</strong>
              </h4>
              <div className="timeline-container">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Installed At</div>
                    <div className="timeline-date">
                      {item.installedAt ? new Date(item.installedAt).toLocaleDateString("vi-VN") : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Requested Day</div>
                    <div className="timeline-date">
                      {item.productionDate ? new Date(item.productionDate).toLocaleDateString("vi-VN") : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Expected Day</div>
                    <div className="timeline-date">
                      {item.warrantyEndDate ? new Date(item.warrantyEndDate).toLocaleDateString("vi-VN") : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="popup-actions">
            <button className="btn-secondary btn-cancel" onClick={onClose}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
