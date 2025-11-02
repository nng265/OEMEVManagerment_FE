import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import "./UI.css";

const Done = ({ open, onClose, data }) => {
  if (!open) return null;

  const campaign = data?.raw ?? {};
  const customer = campaign.customer ?? {};
  const vehicle = campaign.vehicle ?? {};
  const replacements = campaign.replacements ?? [];

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Close button */}
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        {/* Header */}
        <h2>Campaign Details</h2>
        <div className="status-badge status-done">
          {campaign.status ?? "DONE"}
        </div>

        {/* Customer & Vehicle Info */}
        <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <h4>👤 Customer Information</h4>
            <div>{customer.name ?? "—"}</div>
            <div>{customer.phone ?? ""}</div>
            <div>{customer.email ?? ""}</div>
          </div>

          <div style={{ flex: 1 }}>
            <h4>🚗 Vehicle Information</h4>
            <div>Model: {vehicle.model ?? "—"}</div>
            <div>VIN: {vehicle.vin ?? "—"}</div>
            <div>Year: {vehicle.year ?? "—"}</div>
          </div>
        </div>

        <hr />

        {/* Campaign Info */}
        <div>
          <h4>🛠 Campaign Information</h4>
          <div><strong>Title:</strong> {campaign.title ?? "—"}</div>
          <div><strong>Description:</strong> {campaign.description ?? "—"}</div>
          <div><strong>Type:</strong> {campaign.type ?? "—"}</div>
          <div>
            <strong>Period:</strong>{" "}
            {campaign.startDate && campaign.endDate
              ? `${new Date(campaign.startDate).toLocaleDateString()} → ${new Date(campaign.endDate).toLocaleDateString()}`
              : "—"}
          </div>
        </div>

        <hr />

        {/* Replacements Section */}
        <div>
          <h4>🔧 Parts to Replace/Repair</h4>
          {replacements.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 6,
                fontSize: "0.92rem",
              }}
            >
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #ddd" }}>
                    Old Serial
                  </th>
                  <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #ddd" }}>
                    New Serial
                  </th>
                </tr>
              </thead>
              <tbody>
                {replacements.map((rep, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                      {rep.oldSerial}
                    </td>
                    <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                      {rep.newSerial}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>— No replacement data —</div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

Done.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
};

export default Done;
