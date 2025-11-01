import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import "./UI.css";

const UnderRepair = ({ open, onClose, data }) => {
  if (!open) return null;
  const campaign = data?.raw ?? {};
  const customer = campaign.customer ?? {};
  const vehicle = campaign.vehicle ?? {};

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
        <div style={{ color: "#666" }}>{campaign.status ?? "UNDER_REPAIR"}</div>

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
          
          <div>Title: {campaign.title ?? "—"}</div>
          <div>Description: {campaign.description ?? "—"}</div>
          <div>Type: {campaign.type ?? "—"}</div>
          <div>period: {(campaign.startDate && campaign.endDate) ?? "—"}</div>
        </div>

        <hr style={{ margin: "12px 0" }} />
        <div>
          <h4>Parts to Replace/Repair</h4>
          <div>{campaign.partReplace ?? "—"}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={onClose}>Back</Button>
        </div>
      </div>
    </div>
  );
};

UnderRepair.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
};

export default UnderRepair;
