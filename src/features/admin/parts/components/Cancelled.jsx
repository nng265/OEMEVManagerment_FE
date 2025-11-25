import React from "react";
import "./PartList.css";

export function CancelledModal({ request, onClose, isLoading }) {
  if (!request) return null;

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const cancelReason =
    request.issues?.find((x) => x.issueType === "Cancellation")?.reason || "-";

  return (
    <div
      className="pl-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pl-container cancelled">
        <div className="pl-header">
          <h3>Cancelled Request Details</h3>
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
          {/* Status */}
          <div className="pl-info-row">
            <strong>Status:</strong> {request.status}
          </div>

          {/* Service Center */}
          <div className="pl-info-row">
            <strong>Service Center:</strong> {request.serviceCenterName}
          </div>

          {/* Requested Date */}
          <div className="pl-info-row">
            <strong>Requested Date:</strong> {formatDate(request.requestDate)}
          </div>

          {/* Expected Date */}
          <div className="pl-info-row">
            <strong>Expected Date:</strong> {request.expectedDate || "-"}
          </div>

          {/* Cancellation Reason */}
          <div className="pl-info-row">
            <strong>Cancellation Reason:</strong> {cancelReason}
          </div>

          {/* Cancelled Items */}
          <h3>Request Items</h3>
          <table className="pl-parts-table">
            <thead>
              <tr>
                <th>Part Model</th>
                <th>Requested Qty</th>
                <th>OEM Stock</th>
              </tr>
            </thead>
            <tbody>
              {request.partOrderItems?.map((item, i) => (
                <tr key={i}>
                  <td>{item.model}</td>
                  <td>{item.requestedQuantity ?? 0}</td>
                  <td>{item.oemStock ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Close Button */}
          <div className="pl-actions">
            <button
              className="pl-btn-secondary pl-btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CancelledModal;
