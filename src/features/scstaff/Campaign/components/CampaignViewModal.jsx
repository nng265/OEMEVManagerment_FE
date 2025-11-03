import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import "./CampaignViewModal.css";

export const CampaignViewModal = ({ isOpen, onClose, campaign }) => {
  if (!campaign) return null;

  console.log("Campaign data in Modal:", campaign);

  // Helper function để định dạng ngày tháng cho đẹp
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      // Định dạng kiểu "August 4, 2025"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      // <-- Đây là dòng 29
      // ===== SỬA LỖI Ở ĐÂY =====
      // In lỗi ra console để sử dụng biến 'error'
      console.error("Error formatting date:", dateString, error);
      // ==========================

      // Nếu lỗi, trả về 10 ký tự đầu (YYYY-MM-DD)
      return dateString.substring(0, 10);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign.title || "Campaign Detail"}
      size="xl"
      showFooter={false}
    >
      {/* Bố cục mới giống ảnh mẫu */}
      <div className="campaign-modal">
        {/* === Section 1: Thông tin chung === */}
        <h3 className="campaign-section-title">Campaign Information</h3>
        <div className="campaign-info-row">
          {/* Thẻ Mô tả (rộng hết cỡ) */}
          <div className="campaign-info-block full-width">
            <span className="info-block-label">Description</span>
            <span className="info-block-value">
              {campaign.description}
            </span>
          </div>
        </div>

        {/* === Section 2: Chi tiết === */}
        <h3 className="campaign-section-title">Campaign Details</h3>
        <div className="campaign-info-row">
          {/* Thẻ Loại Campaign (nửa chiều rộng) */}
          <div className="campaign-info-block">
            <span className="info-block-label">Campaign Type</span>
            <span className="info-block-value">
              {campaign.type}
            </span>
          </div>
          {/* Thẻ Target Part (nửa chiều rộng) */}
          <div className="campaign-info-block">
            <span className="info-block-label">Target Part</span>
            <span className="info-block-value">
              {campaign.partModel}
            </span>
          </div>
        </div>
        <div className="campaign-info-row">
          {/* Thẻ Ngày bắt đầu (nửa chiều rộng) */}
          <div className="campaign-info-block">
            <span className="info-block-label">Start Date</span>
            <span className="info-block-value">
              {formatDate(campaign.startDate)}
            </span>
          </div>
          {/* Thẻ Ngày kết thúc (nửa chiều rộng) */}
          <div className="campaign-info-block">
            <span className="info-block-label">End Date</span>
            <span className="info-block-value">
              {formatDate(campaign.endDate)}
            </span>
          </div>
        </div>

        {/* === Section 3: Thống kê === */}
        <h3 className="campaign-section-title">Campaign Statistics</h3>
        <div className="campaign-info-row">
          {/* Thẻ Scheduled (1/3 chiều rộng) */}
          <div className="campaign-info-block stat-block">
            <span className="info-block-label">Scheduled</span>
            <span className="info-block-value large-stat">
              {campaign.pendingVehicles}
            </span>
          </div>
          {/* Thẻ In Progress (1/3 chiều rộng) */}
          <div className="campaign-info-block stat-block">
            <span className="info-block-label">In Progress</span>
            <span className="info-block-value large-stat">
              {campaign.inProgressVehicles}
            </span>
          </div>
          {/* Thẻ Completed (1/3 chiều rộng) */}
          <div className="campaign-info-block stat-block">
            <span className="info-block-label">Completed</span>
            <span className="info-block-value large-stat">
              {campaign.completedVehicles}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="campaign-footer">
          <Button variant="secondary" onClick={onClose}>
            Close Campaign
          </Button>
        </div>
      </div>
    </Modal>
  );
};

CampaignViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  campaign: PropTypes.object,
};

export default CampaignViewModal;
