import React, { useState } from "react";
import { toast } from "react-toastify";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./PartList.css"; // shared CSS for modals

export function Pending({ request, onClose, onSetDate, onConfirm, isLoading }) {
  const [requestedDate, setRequestedDate] = useState(
    request.requestedDate || ""
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSetDateClick = () => {
    if (!requestedDate) {
      toast.warning("Please select a date first.");
      return;
    }
    onSetDate(request.orderId, requestedDate);
  };
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleConfirmClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDialog = () => {
    setIsConfirmOpen(false);
    onConfirm(request.orderId);
  };

  const handleCancelDialog = () => {
    setIsConfirmOpen(false);
  };

  const handleClose = () => {
    setRequestedDate("");
    setIsConfirmOpen(false);
    onClose();
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
            <strong>Requested By:</strong> {request.requestedBy}
          </div>
          <div className="pl-info-row">
            <strong>Requested Date:</strong> {formatDate(request.requestedDate)}
          </div>

          <h3>Parts List</h3>
          <table className="pl-parts-table">
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

          <div className="pl-date-section">
            <label>Update Requested Date:</label>
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
            />
          </div>

          <div className="pl-actions">
            <button
              className="pl-btn-secondary pl-btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="pl-btn-secondary"
              onClick={handleSetDateClick}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Set to Waiting"}
            </button>
            <button
              className="pl-btn-primary"
              onClick={handleConfirmClick}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm & Prepare"}
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Request"
        message="Confirm & prepare this request?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDialog}
        onCancel={handleCancelDialog}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Pending;
