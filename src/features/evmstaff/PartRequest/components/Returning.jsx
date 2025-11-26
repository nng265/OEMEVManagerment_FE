import React, { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import {
  request as apiRequest,
  ApiEnum,
} from "../../../../services/NetworkUntil";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./PartsListEVM.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Component Timeline
const Timeline = ({ request }) => {
  if (!request) return null;
  const steps = [
    { label: "Request Created", date: request.requestDate, active: true },
    {
      label: "Confirmed",
      date: request.approvedDate,
      active: !!request.approvedDate,
    },
    {
      label: "Shipped",
      date: request.shippedDate,
      active: !!request.shippedDate,
    },
    { label: "Returning", date: request.lastUpdated, active: true },
  ];

  return (
    <div
      className="timeline-inline"
      style={{ marginTop: "0", paddingTop: "0", borderTop: "none" }}
    >
      <h4 style={{ marginBottom: "15px", color: "#4a5568" }}>
        Request Timeline
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`timeline-item ${step.active ? "active" : ""}`}
          >
            <div className="timeline-icon"></div>
            <div className="timeline-content">
              <h4>{step.label}</h4>
              {step.date ? (
                <p>{formatDate(step.date)}</p>
              ) : (
                <p style={{ fontStyle: "italic", fontSize: "0.8rem" }}>
                  Pending...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Returning({ request, onClose, onRefresh }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!request) return null;

  // --- HANDLER: ACKNOWLEDGE RETURN RECEIPT ---
  const handleAcknowledgeReturn = async () => {
    // Lấy ID an toàn
    const safeOrderId = request.orderId || request.orderID || request.id;

    if (!safeOrderId) {
      toast.error("System Error: Missing Order ID.");
      return;
    }

    setIsLoading(true);
    try {
      // [FIX] Dùng 'apiRequest' thay vì 'request'
      const response = await apiRequest(
        ApiEnum.ACKNOWLEDGE_RETURN_RECEIPT,
        { params: { orderId: safeOrderId } },
        "PUT"
      );

      if (response.success) {
        toast.success(
          "Return acknowledged! Status updated to ReturnInspection."
        );
        if (onRefresh) onRefresh();
        onClose();
      } else {
        toast.error(response.message || "Failed to acknowledge return.");
      }
    } catch (err) {
      console.error("API Error:", err);
      const msg =
        err?.responseData?.message ||
        err?.message ||
        "System error while acknowledging return.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <div className="popup-overlay">
        <div className="popup-card returning">
          {/* HEADER */}
          <div
            className="popup-header"
            style={{ borderBottomColor: "#fdba74" }}
          >
            <h3>Parts Request Details - {request.status}</h3>
          </div>

          <div className="popup-body">
            {/* 1. INFO SECTION */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <div className="info-row">
                  <strong>Service Center:</strong>{" "}
                  {request.serviceCenterName || request.serviceCenter}
                </div>
                <div className="info-row">
                  <strong>Requested By:</strong>{" "}
                  {request.requestedBy || request.createdByName}
                </div>
                <div className="info-row">
                  <strong>Requested Date:</strong>{" "}
                  {formatDate(request.requestDate)}
                </div>
              </div>
              <div>
                {request.notes && (
                  <div
                    style={{
                      background: "#fff7ed",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #fdba74",
                    }}
                  >
                    <strong>Note:</strong>{" "}
                    <span style={{ fontSize: "0.9rem" }}>{request.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. REQUESTED PARTS (RETURNING) */}
            <h4 style={{ marginTop: "10px", marginBottom: "5px" }}>
              Returning Parts
            </h4>
            <table className="parts-detail">
              <thead>
                <tr>
                  <th>Part Model</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "center" }}>OEM Stock</th>
                </tr>
              </thead>
              <tbody>
                {request.parts?.map((p, i) => (
                  <tr key={i}>
                    <td>{p.model}</td>
                    <td style={{ textAlign: "center" }}>{p.requestedQty}</td>
                    <td style={{ textAlign: "center" }}>{p.oemStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="info-row" style={{ marginTop: "10px" }}>
              <strong>Expected Delivery Date:</strong>{" "}
              <span style={{ color: "#2b6cb0" }}>
                {request.expectedDate
                  ? formatDate(request.expectedDate)
                  : "Not set"}
              </span>
            </div>

            {/* 3. TIMELINE */}
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: "#fafbfc",
              }}
            >
              <Timeline request={request} />
            </div>

            {/* 4. ACTIONS */}
            <div className="popup-actions" style={{ marginTop: "30px" }}>
              <button
                className="btn-secondary btn-cancel"
                onClick={onClose}
                disabled={isLoading}
              >
                Close
              </button>

              <button
                className="btn-confirm"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isLoading}
                style={{
                  backgroundColor: "#ed8936",
                  minWidth: "220px",
                }}
              >
                {isLoading ? "Processing..." : "📦 Acknowledge Receipt"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Acknowledge Return Receipt"
        message="Confirm that you have received the returned parts from the Service Center? This will update status to 'Return Inspection'."
        confirmLabel="Yes, Acknowledge"
        cancelLabel="Cancel"
        onConfirm={handleAcknowledgeReturn}
        onCancel={() => setShowConfirmDialog(false)}
        isLoading={isLoading}
      />
    </>
  );
}

Returning.propTypes = {
  request: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onRefresh: PropTypes.func,
};
