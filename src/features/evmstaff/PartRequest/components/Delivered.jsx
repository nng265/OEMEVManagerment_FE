import React from "react";
import "./PartsListEVM.css";

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
    <div className="popup-overlay">
      <div className="popup-card">
          <h3>Parts Request Details</h3>

        <div className="popup-body">
          <div className="info-row">
            <strong>Status:</strong> {request.status}
          </div>
          <div className="info-row">
            <strong>Service Center:</strong> {request.serviceCenter}
          </div>
          <div className="info-row">
            <strong>Requested Date:</strong> {formatDate(request.requestedDate)}

          </div>
          <div className="info-row">
            <strong>Expected Date:</strong>{" "}
            {request.waitingDate || request.expectedDate}
          </div>

          <h3>Delivered Parts</h3>
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
