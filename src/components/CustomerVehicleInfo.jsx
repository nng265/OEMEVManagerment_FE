// src/components/CustomerVehicleInfo.jsx
import React from "react";
import "./CommonSections.css";

const CustomerVehicleInfo = ({ customer, vehicle }) => {
  if (!vehicle || !customer) {
    return <p>Đang tải thông tin khách hàng và xe...</p>;
  }

  return (
    <div className="info-container">
      <div className="info-section">
        <div className="icon person-icon" />
        <div>
          <h3>Customer Information</h3>
          <p className="info-name">{customer.name}</p>
          <p className="info-phone">{customer.phone || "—"}</p>
        </div>
      </div>

      <div className="info-section">
        <div className="icon car-icon" />
        <div>
          <h3>Vehicle Information</h3>
          <p>
            <strong>Model:</strong> {vehicle.model}
          </p>
          <p>
            <strong>VIN:</strong> {vehicle.vin}
          </p>
          <p>
            <strong>Year:</strong> {vehicle.year}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerVehicleInfo;
