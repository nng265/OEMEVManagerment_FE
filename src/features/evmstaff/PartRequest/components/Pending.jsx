import React, { useState } from "react";
import "./PartsListEVM.css";

export function Pending({ request, onClose, onSetDate, onConfirm, isLoading }) {
  const [requestedDate, setRequestedDate] = useState(
    request.requestedDate || ""
  );

  const handleSetDateClick = () => {
    if (!requestedDate) {
      alert("Please select a date first.");
      return;
    }
    onSetDate(request.orderId, requestedDate); // cập nhật Requested Date
  };

  const handleConfirmClick = () => {
    if (window.confirm("Confirm & prepare this request?")) {
      onConfirm(request.orderId);
    }
  };

  const handleClose = () => {
    setRequestedDate("");
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
            <strong>Requested By:</strong> {request.requestedBy}
          </div>
          <div className="info-row">
            <strong>Requested Date:</strong> {request.requestedDate}
          </div>

          <h4>Parts List</h4>
          <table className="parts-detail">
            <thead>
              <tr>
                <th>Part Model</th>
                <th>Requested Qty</th>
                <th>SC Stock</th>
                <th>Oem Stock</th>
              </tr>
            </thead>
            <tbody>
              {request.parts?.map((p, i) => (
                <tr key={i}>
                  <td>{p.model}</td>
                  <td>{p.requestedQty ?? 0}</td>
                  <td>{p.scStock}</td>
                  <td>{p.oemStock}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="expected-date">
            <label>Update Requested Date:</label>
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
            />
          </div>

          <div className="popup-actions">
            <button
              className="btn-secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="btn-secondary"
              onClick={handleSetDateClick}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Set to Waiting"}
            </button>
            <button
              className="btn-confirm"
              onClick={handleConfirmClick}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm & Prepare"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pending;
