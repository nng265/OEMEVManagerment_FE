import React from "react";
import "./Accessory.css";

export default function OnVehicle({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-card installed">
        <div className="popup-header">
          <h1>OnVehicle</h1>
        </div>

        {/* 2 COLUMNS LAYOUT */}
        <div className="popup-body two-column-layout">
          {/* LEFT SIDE */}
          <div className="left-panel">
            {/* Customer Info */}
            <div className="info-section">
              <h4>
                <strong>Customer Information</strong>
              </h4>
              <div>Name: {item.customerName}</div>
              <div>Phone: {item.customerPhone}</div>
              <div>Email: {item.customerEmail}</div>
            </div>

            {/* Vehicle Info */}
            <div className="info-section">
              <h4>
                <strong>Vehicle Information</strong>
              </h4>
              <div>Vin: {item.vin}</div>
              <div>Model: {item.carModel}</div>
              <div>Year: {item.carYear}</div>
            </div>

            {/* Detail */}
            <div className="info-section">
              <h4>
                <strong>Detail</strong>
              </h4>
              <div>Serial: {item.serialNumber}</div>
              <div>Model: {item.model}</div>
              <div>Condition: {item.condition}</div>
              <div>Warranty Months: {item.warrantyPeriodMonths}</div>
              <div>Note: {item.note}</div>
            </div>
          </div>

          {/* RIGHT SIDE — Timeline */}
          <div className="right-panel">
            <h4>
              <strong>History Timeline</strong>
            </h4>

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

        <div className="popup-actions">
          <button className="btn-secondary btn-cancel" onClick={onClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
