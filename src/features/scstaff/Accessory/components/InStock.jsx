import React from "react";
import "./AccessoryList.css";

export default function InStock({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-card instock">
        <div className="popup-header">
          <h1>In Stock</h1>
        </div>

        <div className="popup-body">
          {/* Detail Section */}
          <div className="info-row">
            <div className="info-column">
              <h4>Detail</h4>
              <div style={{ marginTop: 12, marginLeft: 24  }}>Serial: {item.serialNumber}</div>
              <div style={{ marginTop: 6, marginLeft: 24  }}>Part Model: {item.model}</div>
              <div style={{ marginTop: 6, marginLeft: 24  }}>Condition: {item.condition}</div>
              <div style={{ marginTop: 6, marginLeft: 24  }}>Warranty Period: {item.warrantyPeriodMonths}</div>
              <div style={{ marginTop: 6, marginLeft: 24  }}>Warranty End Date: {item.warrantyEndDate}</div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="info-row">
            <div className="parent-container">
              <h4>
                <strong>Time Line</strong>
              </h4>

                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Production Date</div>
                    <div className="timeline-date">
                      {item.productionDate ? new Date(item.productionDate).toLocaleDateString("vi-VN") : "N/A"}
                    </div>
                  </div>
                </div>
                
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
                    <div className="timeline-title">Uninstalled At</div>
                    <div className="timeline-date">
                      {item.uninstalledAt ? new Date(item.uninstalledAt).toLocaleDateString("vi-VN") : "N/A"}
                    </div>
                  </div>
                </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="popup-actions">
            <button className="btn-secondary" onClick={onClose}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
