
import React from "react";
import "./AccessoryList.css";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export default function OnVehicle({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="popup-overlay">
      <div className="popup-card onvehicle">
        <div className="popup-header">
          <h1>On Vehicle</h1>
        </div>

        <div className="popup-body">
          <div className="info-row">
            <div>
              <h4>
                <strong>Customer Information</strong>
              </h4>
              <div style={{ marginTop: 12, marginLeft: 24  }}>Name: {item.customerName}</div>
              <div style={{ marginTop: 6, marginLeft: 24  }}>Phone: {item.customerPhone}</div>
              <div style={{ marginTop: 6, marginLeft: 24  }}>Email: {item.customerEmail}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <h4>
                <strong>Vehicle Information</strong>
              </h4>
              <div style={{ marginTop: 12, textAlign: "left", marginLeft: 24  }}>Vin: {item.vin}</div>
              <div style={{ marginTop: 6, textAlign: "left", marginLeft: 24  }}>Model: {item.carModel}</div>
              <div style={{ marginTop: 6, textAlign: "left", marginLeft: 24  }}>Year: {item.carYear}</div>
            </div>
          </div>

          <div className="info-row">
            <div>
              <h4>
                <strong>Detail</strong>
              </h4>
              <div style={{ marginTop: 12, marginLeft: 24  }}>Serial: {item.serialNumber}</div>
              <div style={{ marginTop: 6, marginLeft: 24  }}>Part Model: {item.model}</div>
              <div style={{ marginTop: 6, marginLeft: 24  }}>Condition: {item.condition}</div>
              {/* <div style={{ marginTop: 6, marginLeft: 24  }}>PeriodMonths: {item.warrantyPeriodMonths} </div> */}
              <div style={{ marginTop: 6, marginLeft: 24  }}>Production Date: {formatDate(item.productionDate)}</div>
              <div style={{ marginTop: 6, marginLeft: 24  }}>Service Center Name: {item.serviceCenterName}</div>
              {/* <div style={{ marginTop: 6, marginLeft: 24  }}>Warranty End Date: {formatDate(item.warrantyEndDate)}</div> */}
            </div>
          </div>
          <div className="info-row">
            <div className="parent-container">
              <h4>
                <strong>Time Line</strong>
              </h4>
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

                {/* <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Production Date</div>
                    <div className="timeline-date">
                      {item.productionDate ? new Date(item.productionDate).toLocaleDateString("vi-VN") : "N/A"}
                    </div>
                  </div>
                </div> */}
              
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
