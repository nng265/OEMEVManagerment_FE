import React, { useState } from "react";
import { toast } from "react-toastify";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./PartsListEVM.css";

export function Waiting({ request, onClose, onSetDate, onConfirm, isLoading }) {
  const [requestedDate, setRequestedDate] = useState(
    request.requestedDate || ""
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const getNextDay = (dateStr) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

  const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

  const handleSetDateClick = () => {
    if (!requestedDate) {
      toast.warning("Please select a date first.");
      return;
    }
    onSetDate(request.orderId, requestedDate); // cập nhật Requested Date
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
            <strong>Expected Delivery:</strong>{" "}
            {request.expectedDate || "Not set"}
          </div>

          <h3>Parts List</h3>

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
              min={getNextDay(request.requestedDate)}
              onChange={(e) => setRequestedDate(e.target.value)}
            />
          </div>

          <div className="popup-actions">
            <button
              className="btn-secondary btn-cancel"
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
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Request"
        message="Confirm & mark this request as ready for delivery?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDialog}
        onCancel={handleCancelDialog}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Waiting;
