import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import "./UI.css";

const Repaired = ({ open, onClose, data, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const campaign = data?.raw ?? {};
  const vehicle = campaign.vehicle ?? {};
  const customer = campaign.customer ?? {};

  const handleCustomerGetCar = async () => {
    const id = campaign.campaignVehicleId ?? campaign.id;
    if (!id) {
      alert("Missing id");
      return;
    }
    setLoading(true);
    try {
      // call repaired -> then after repaired maybe call done endpoint? per mapping, REPAIRED -> CAMPAIGNVEHICLE_STAFF_REPAIRED
      await request(ApiEnum.CAMPAIGNVEHICLE_STAFF_REPAIRED, { params: { id } });
      // After marking repaired the UI in your screenshot shows a "Customer get car" button that calls done.
      // If you want to directly call done instead, adapt here. For now we call 'repaired' then refresh.
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Repaired failed", err);
      alert("Failed to update repaired status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div style={{
        background: "#fff",
        borderRadius: 8,
        width: 520,
        padding: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            border: "none",
            background: "transparent",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <h2>Campaign</h2>
        <div style={{ color: "#666" }}>{campaign.status ?? "REPAIRED"}</div>

        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <h4>👤 Customer Information</h4>
            <div>{customer.name ?? "—"}</div>
            <div>{customer.phone ?? ""}</div>
          </div>

          <div style={{ flex: 1 }}>
            <h4>🚗 Vehicle Information</h4>
            <div>Model: {vehicle.model ?? "—"}</div>
            <div>VIN: {vehicle.vin ?? "—"}</div>
            <div>Year: {vehicle.year ?? "—"}</div>
          </div>
        </div>

        <hr style={{ margin: "12px 0" }} />

        <div>
          <h4>Parts to Replace/Repair</h4>
          <div>Title: {campaign.title ?? "—"}</div>
          <div>Description: {campaign.description ?? "—"}</div>
          <div>Type: {campaign.type ?? "—"}</div>
          <div>period: {(campaign.startDate && campaign.endDate) ?? "—"}</div>
        </div>

        <hr style={{ margin: "12px 0" }} />
        <div>
          <h4>Parts to Replace/Repair</h4>
          <div>old serial: {campaign.oldSerial ?? "—"}</div>
          <div>new serial: {campaign.newSerial ?? "—"}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={handleCustomerGetCar} disabled={loading}>
            {loading ? "Processing..." : "Customer get car"}
          </Button>
        </div>
      </div>
    </div>
  );
};

Repaired.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default Repaired;
