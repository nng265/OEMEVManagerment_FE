import React from "react";
import "./Accessory.css";

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
              <div>Serial: {item.serialNumber}</div>
              <div>Model: {item.model}</div>
              <div>Condition: {item.condition}</div>
              <div>Warranty Period: {item.warrantyPeriodMonths}</div>
              <div>Note: {item.note}</div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="info-row">
            <div className="info-column">
              <h4>Time Line</h4>
              <div className="timeline-container">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Installed At</div>
                    <div className="timeline-date">
                      {item.installedAt
                        ? new Date(item.installedAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Requested Day</div>
                    <div className="timeline-date">
                      {item.productionDate
                        ? new Date(item.productionDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Expected Day</div>
                    <div className="timeline-date">
                      {item.warrantyEndDate
                        ? new Date(item.warrantyEndDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </div>
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
