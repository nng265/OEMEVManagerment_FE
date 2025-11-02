import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";
import "./UI.css";

const Repaired = ({ open, onClose, data, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const pendingActionRef = useRef(null);
  if (!open) return null;

  const campaign = data?.raw ?? {};
  const vehicle = campaign.vehicle ?? {};
  const customer = campaign.customer ?? {};
  const replacements = campaign.replacements ?? [];

  const openConfirmRepaired = () => {
    const id = campaign.campaignVehicleId ?? campaign.id;
    if (!id) {
      toast.warning("Missing id");
      return;
    }
    pendingActionRef.current = { id };
    setIsConfirmOpen(true);
  };

  const handleCustomerGetCar = async () => {
    const id =
      pendingActionRef.current?.id ?? campaign.campaignVehicleId ?? campaign.id;
    if (!id) {
      toast.warning("Missing id");
      return;
    }
    setLoading(true);
    try {
      await request(ApiEnum.CAMPAIGNVEHICLE_STAFF_REPAIRED, { params: { id } });
      toast.success("Updated status to REPAIRED successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Repaired failed", err);
      const msg =
        err?.responseData?.message ||
        err?.message ||
        "Failed to update repaired status";
      toast.error(msg);
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
      pendingActionRef.current = null;
    }
  };

  return (
    <>
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
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            width: 520,
            padding: 20,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            position: "relative",
          }}
        >
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
            <h4>🛠 Campaign Information</h4>
            <div>Title: {campaign.title ?? "—"}</div>
            <div>Description: {campaign.description ?? "—"}</div>
            <div>Type: {campaign.type ?? "—"}</div>
            <div>period: {(campaign.startDate && campaign.endDate) ?? "—"}</div>
          </div>

          <hr style={{ margin: "12px 0" }} />
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
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Old Serial
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      New Serial
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {replacements.map((rep, idx) => (
                    <tr key={idx}>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {rep.oldSerial}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <Button variant="secondary" onClick={onClose}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={openConfirmRepaired}
              disabled={loading}
            >
              {loading ? "Processing..." : "Customer get car"}
            </Button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Update"
        message="Mark this campaign vehicle as REPAIRED?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleCustomerGetCar}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={loading}
      />
    </>
  );
};

Repaired.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default Repaired;
