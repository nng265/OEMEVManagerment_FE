import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./PartsListEVM.css";

export default function InTransit({
  request,
  onClose,
  isLoading,
  reasonOptions = [],
  loadingReasons = false,
  reasonError = "",
  onLoadReasons,
  onReturnShipment, // <-- gọi API return shipment
}) {
  const [reason, setReason] = useState("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [note, setNote] = useState("");
  const [showIncident, setShowIncident] = useState(false);

  const isValid = Boolean(
    reason && (reason !== "Other" || reasonDetail.trim())
  );

  const formatDate = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return String(date);
    }
  };

  const handleSubmit = () => {
    if (!isValid || isLoading) return;

    onReturnShipment?.({
      orderId: request?.orderId,
      reason,
      reasonDetail: reason === "Other" ? reasonDetail.trim() : null,
      note: note.trim(),
    });
  };

  useEffect(() => {
    if (showIncident && reasonOptions.length === 0 && !loadingReasons) {
      onLoadReasons?.();
    }
  }, [showIncident, reasonOptions.length, loadingReasons, onLoadReasons]);

  if (!request) return null;

  return (
    <div
      className="pl-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`pl-container ${request.status?.toLowerCase() || ""}`}>
        <div className="pl-header">
          <h3>Parts Request Details</h3>
          <button
            type="button"
            className="pl-close-btn"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="pl-content">
          <div className="pl-info-row">
            <strong>Status:</strong> {request?.status || "-"}
          </div>
          <div className="pl-info-row">
            <strong>Service Center:</strong>{" "}
            {request?.serviceCenter || request?.serviceCenterName || "-"}
          </div>
          <div className="pl-info-row">
            <strong>Requested Date:</strong>{" "}
            {formatDate(request?.requestedDate)}
          </div>
          <div className="pl-info-row">
            <strong>Expected Date:</strong>{" "}
            {formatDate(request?.expectedDate || request?.waitingDate)}
          </div>

          <h3>Delivered Parts</h3>
          <table className="pl-parts-table big">
            <thead>
              <tr>
                <th>Part Model</th>
                <th>Requested Qty</th>
                <th>Oem Stock</th>
              </tr>
            </thead>
            <tbody>
              {(request?.parts || request?.partOrderItems || []).map((p, i) => (
                <tr key={i}>
                  <td>{p.model}</td>
                  <td>{p.requestedQty ?? p.quantity ?? 0}</td>
                  <td>{p.oemStock ?? 0}</td>
                </tr>
              ))}
              {!(request?.parts || request?.partOrderItems)?.length && (
                <tr>
                  <td colSpan={3} style={{ padding: 12, color: "#64748b" }}>
                    No parts
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {showIncident && (
            <>
              <h3 style={{ marginTop: 8 }}>Serious Incident Report</h3>

              <div
                className="pl-date-section"
                style={{ flexDirection: "column", alignItems: "flex-start" }}
              >
                <label>Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isLoading || loadingReasons}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e0",
                    backgroundColor: loadingReasons ? "#f1f5f9" : "#fff",
                  }}
                >
                  {reason === "" && !loadingReasons && (
                    <option value="">-- Choose option --</option>
                  )}
                  {loadingReasons && (
                    <option value="" disabled>
                      Loading reasons...
                    </option>
                  )}
                  {!loadingReasons &&
                    reasonOptions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.description || r.label || r.value}
                      </option>
                    ))}
                </select>
                {reasonError && (
                  <div style={{ color: "#c53030", fontSize: 12, marginTop: 4 }}>
                    {reasonError}
                  </div>
                )}
              </div>

              {reason === "Other" && (
                <div
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    marginTop: 8,
                  }}
                >
                  <label>Other reason details</label>
                  <input
                    type="text"
                    value={reasonDetail}
                    onChange={(e) => setReasonDetail(e.target.value)}
                    disabled={isLoading}
                    placeholder="Please specify"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e0",
                    }}
                  />
                </div>
              )}

              <div
                className="pl-date-section"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginTop: 8,
                }}
              >
                <label>Notes (incident report, insurance/police ref)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={5}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e0",
                    resize: "vertical",
                  }}
                />
              </div>
            </>
          )}

          <div
            className="pl-actions"
            style={{ justifyContent: "space-between" }}
          >
            <button
              className="pl-btn-secondary pl-btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>

            {!showIncident && (
              <button
                className="pl-btn-primary"
                onClick={() => setShowIncident(true)}
                disabled={isLoading}
                style={{ backgroundColor: "red", borderColor: "red" }}
              >
                Emergency Report
              </button>
            )}

            {showIncident && (
              <button
                className="pl-btn-primary"
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
              >
                Confirm report & accept loss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

InTransit.propTypes = {
  request: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  reasonOptions: PropTypes.array,
  loadingReasons: PropTypes.bool,
  reasonError: PropTypes.string,
  onLoadReasons: PropTypes.func,
  onReturnShipment: PropTypes.func.isRequired,
};
