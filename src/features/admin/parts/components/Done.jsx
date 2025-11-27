import React from "react";
import "./PartList.css";

export function Done({ request, onClose }) {
  if (!request) return null;

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleClose = () => {
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
            <strong>Order ID:</strong> {request.orderId}
          </div>
          <div className="pl-info-row">
            <strong>Status:</strong> {request.status}
          </div>
          <div className="pl-info-row">
            <strong>Service Center:</strong> {request.serviceCenterName}
          </div>
          <div className="pl-info-row">
            <strong>Created By:</strong> {request.createdByName}
          </div>
          <div className="pl-info-row">
            <strong>Request Date:</strong> {formatDate(request.requestDate)}
          </div>
          <div className="pl-info-row">
            <strong>Approved Date:</strong> {formatDate(request.approvedDate)}
          </div>
          <div className="pl-info-row">
            <strong>Shipped Date:</strong> {formatDate(request.shippedDate)}
          </div>
          <div className="pl-info-row">
            <strong>Delivery Date:</strong> {formatDate(request.partDelivery)}
          </div>
          <div className="pl-info-row">
            <strong>Total Items:</strong> {request.totalItems}
          </div>

          <h3>Parts List</h3>
          <table className="pl-parts-table">
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Part Model</th>
                <th>Quantity</th>
                <th>SC Stock</th>
                <th>OEM Stock</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {request.partOrderItems?.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.model}</td>
                  <td>{item.quantity}</td>
                  <td>{item.scStock}</td>
                  <td>{item.oemStock}</td>
                  <td>{item.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pl-actions">
            <button
              className="pl-btn-secondary pl-btn-cancel"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Done;
