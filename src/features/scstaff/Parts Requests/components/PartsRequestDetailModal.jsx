import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { DetailModalActions } from "../../../../components/molecules/DetailModalActions/DetailModalActions";
import { Button } from "../../../../components/atoms/Button/Button";
import { formatDate } from "../../../../services/helpers";
import "./PartsRequest.css";

export const PartsRequestDetailModal = ({
  isOpen,
  onClose,
  requestData,
  onConfirmDelivered, // Đảm bảo tên prop này khớp với container
  isConfirming = false,
}) => {
  if (!requestData) return null;

  const {
    requestID,
    status,
    partOrderItems = [],
    timeline = [], // Nhận timeline đã đúng thứ tự từ container
    expectedDate,
  } = requestData;

  const currentStatus = (status || "").trim().toLowerCase();

  console.log("Current Status:", currentStatus);
  console.log("Timeline Data Received:", timeline);

  const renderTimeline = () => (
    <div className="timeline-container">
      {/* --- XÓA .sort() Ở ĐÂY --- */}
      {timeline.map((item, index) => (
        <div className="timeline-item" key={index}>
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <div className="timeline-title">{item.status || "Event"}</div>
            <div className="timeline-date">
              {formatDate(item.date, "en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
            {item.notes && <p className="timeline-notes">{item.notes}</p>}
          </div>
        </div>
      ))}
      {/* --- KẾT THÚC XÓA --- */}
      {timeline.length === 0 && (
        <p className="timeline-empty">No timeline events available.</p>
      )}
    </div>
  );

  const renderPartsTable = () => (
    <div className="table-responsive">
      <table className="parts-request-table">
        <thead>
          <tr>
            <th>Part Model</th>
            <th>Requested QTY</th>
            <th>SC Stock</th>
          </tr>
        </thead>
        <tbody>
          {partOrderItems.map((part, index) => (
            <tr key={part.orderItemId || index}>
              <td>{part.model || "N/A"}</td>
              <td>{part.requestedQuantity ?? 0}</td>
              <td>{part.scStock ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  let modalTitle = status || "Request Details";
  if (currentStatus === "deliverd") {
    modalTitle = "Delivered";
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      showFooter={false}
    >
      <DetailSection title="Requested Parts">
        {renderPartsTable()}
      </DetailSection>

      {currentStatus === "waiting" && (
        <DetailSection title="Delivery Information">
          <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="detail-item">
              <span className="label">Expected Delivery Date:</span>
              <span
                className="value"
                style={{ color: "var(--bs-primary)", fontWeight: "600" }}
              >
                {expectedDate
                  ? formatDate(expectedDate, "vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Not specified"}
              </span>
            </div>
          </div>
        </DetailSection>
      )}

      <DetailSection title="Timeline">{renderTimeline()}</DetailSection>

      <DetailModalActions onBack={onClose} backLabel="Close">
        {(currentStatus === "delivered" || currentStatus === "deliverd") && (
          <Button
            variant="success"
            onClick={() => onConfirmDelivered(requestID)} // Sử dụng đúng tên prop
            isLoading={isConfirming}
          >
            confirm Delivered
          </Button>
        )}
      </DetailModalActions>
    </Modal>
  );
};

PartsRequestDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  requestData: PropTypes.object,
  onConfirmDelivered: PropTypes.func.isRequired, // Đảm bảo tên prop này khớp
  isConfirming: PropTypes.bool,
};

export default PartsRequestDetailModal;
