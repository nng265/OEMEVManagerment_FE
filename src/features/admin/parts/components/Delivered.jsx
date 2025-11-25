import React from "react";
import "./PartList.css"; // shared modal styles

export function Delivered({ request, onClose, isLoading }) {
  if (!request) return null;

  const handleClose = () => {
    onClose();
  };
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <div
      className="pl-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={`pl-container ${request.status?.toLowerCase() || ""}`}>
        <div className="pl-header">
          <h3>Parts Request Details</h3>
          <button
            type="button"
            className="pl-close-btn"
            aria-label="Close"
            onClick={handleClose}
          >
            &times;
          </button>
        </div>
        <div className="pl-content">
          <div className="pl-info-row">
            <strong>Status:</strong> {request.status}
          </div>
          <div className="pl-info-row">
            <strong>Service Center:</strong> {request.serviceCenter}
          </div>
          <div className="pl-info-row">
            <strong>Requested Date:</strong> {formatDate(request.requestedDate)}
          </div>
          <div className="pl-info-row">
            <strong>Expected Date:</strong>{" "}
            {request.waitingDate || request.expectedDate}
          </div>

          <h3>Delivered Parts</h3>
          <table className="pl-parts-table">
            <thead>
              <tr>
                <th>Part Model</th>
                <th>Requested Qty</th>
                <th>Oem Stock</th>
              </tr>
            </thead>
            <tbody>
              {request.parts?.map((p, i) => (
                <tr key={i}>
                  <td>{p.model}</td>
                  <td>{p.requestedQty ?? 0}</td>
                  <td>{p.oemStock ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pl-actions">
            <button
              className="pl-btn-secondary pl-btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Delivered;
