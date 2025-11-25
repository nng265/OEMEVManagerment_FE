import React, { useState } from "react";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./PartList.css"; // shared modal styles

export function Comfirm({ request, onClose, onDelivered, isLoading }) {
  if (!request) return null;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDeliveredClick = () => {
    setIsConfirmOpen(true);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleConfirmDialog = () => {
    setIsConfirmOpen(false);
    onDelivered(request.orderId);
  };

  const handleCancelDialog = () => {
    setIsConfirmOpen(false);
  };

  const handleClose = () => {
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
            <button
              className="pl-btn-primary"
              onClick={handleDeliveredClick}
              disabled={isLoading}
            >
              {isLoading ? "Marking..." : "Delivered"}
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Delivery"
        message="Mark this request as delivered?"
        confirmLabel="Delivered"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDialog}
        onCancel={handleCancelDialog}
        isLoading={isLoading}
      />
    </div>
  );
}
export default Comfirm;
