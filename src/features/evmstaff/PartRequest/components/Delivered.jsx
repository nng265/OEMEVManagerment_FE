import React from "react";
import "./PartsListEVM.css";

export function Delivered({ request, onClose, isLoading }) {
  if (!request) return null;

  const handleClose = () => {
    onClose();
  };
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <div className="popup-header">
          <h3>Parts Request Details</h3>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="popup-body">
          <div className="info-row">
            <strong>Status:</strong> {request.status}
          </div>
          <div className="info-row">
            <strong>Service Center:</strong> {request.serviceCenter}
          </div>
          <div className="info-row">
            <strong>Requested Date:</strong> {request.requestedDate}
          </div>
          <div className="info-row">
            <strong>Expected Date:</strong>{" "}
            {request.waitingDate || request.expectedDate}
          </div>

          <h4>Delivered Parts</h4>
          <table className="parts-detail">
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

          <div className="popup-actions">
            <button
              className="btn-secondary btn-cancel"
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
