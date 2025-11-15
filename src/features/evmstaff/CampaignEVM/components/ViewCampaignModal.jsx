import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./ViewCampaignModal.css";

/*
  - Props:
    * isOpen: boolean -> điều khiển hiển thị modal
    * onClose: function -> callback đóng modal
    * campaign: object -> đối tượng campaign (có thể đã được normalize trong container)
    * onCloseCampaign: optional function -> callback khi người dùng xác nhận đóng campaign

  Ghi chú kỹ thuật:
  - Component cố gắng chuẩn hoá/đọc nhiều tên trường khác nhau từ `campaign`
    (ví dụ: `campaign._raw.campaignId` hoặc `campaign.id`) để tương thích với các
    payload API khác nhau.
  - Không gọi API trực tiếp tại đây; hành động đóng campaign được ủy quyền cho
    parent thông qua `onCloseCampaign`.
*/

export const ViewCampaignModal = ({
  isOpen,
  onClose,
  campaign,
  onCloseCampaign,
}) => {
  // Local state để hiển thị confirm dialog khi user bấm Close Campaign
  const [showConfirm, setShowConfirm] = useState(false);

  // Nếu không có campaign được truyền vào thì không render gì
  if (!campaign) return null;

  // Chuẩn hoá campaign id: API có thể trả id ở nhiều vị trí khác nhau
  const campaignId =
    campaign._raw?.campaignId ||
    campaign._raw?.id ||
    campaign.campaignId ||
    campaign.id;

  // Xử lý khi user xác nhận đóng campaign
  // - Kiểm tra campaignId, gọi callback onCloseCampaign do parent cung cấp
  // - Đóng confirm dialog và modal
  const handleCloseCampaign = () => {
    if (!campaignId) {
      // Nếu thiếu id, ghi log để dev biết (không cố thực hiện hành động)
      console.warn("Missing campaign id", campaign);
      return;
    }
    // Gọi hàm callback parent (nếu có) để parent thực hiện action (API call)
    onCloseCampaign?.(campaignId);
    // Tắt confirm và đóng modal
    setShowConfirm(false);
    onClose();
  };

  // Hàm tiện ích format ngày: nhận string, trả chuỗi dễ đọc
  // Nếu input không hợp lệ trả ký tự '—'
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      // Fallback: lấy 10 ký tự đầu (YYYY-MM-DD) nếu không thể format
      return dateString.substring(0, 10);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={campaign.title || "Campaign Detail"}
        size="xl"
        showFooter={false}
      >
        <div className="campaign-modal">
          {/* === Section 1: Campaign Info === */}
          <h3 className="campaign-section-title">Campaign Information</h3>
          <div className="campaign-info-row">
            <div className="campaign-info-block full-width">
              <span className="info-block-label">Description</span>
              {/* Hiển thị mô tả; đã normalize trong container nên dùng trực tiếp */}
              <span className="info-block-value">{campaign.description}</span>
            </div>
          </div>

          {/* === Section 2: Details === */}
          <h3 className="campaign-section-title">Campaign Details</h3>
          <div className="campaign-info-row">
            <div className="campaign-info-block">
              <span className="info-block-label">Campaign Type</span>
              {/* Loại campaign: Recall / Service */}
              <span className="info-block-value">{campaign.type}</span>
            </div>
            <div className="campaign-info-block">
              <span className="info-block-label">Target Part</span>
              {/* Phần thay thế / part target */}
              <span className="info-block-value">{campaign.target}</span>
            </div>
          </div>
          <div className="campaign-info-row">
            <div className="campaign-info-block">
              <span className="info-block-label">Period</span>
              {/* Sử dụng formatDate để hiển thị ngày đẹp hơn */}
              <span className="info-block-value">
                {formatDate(campaign.startDate)}
              </span>
            </div>
            <div className="campaign-info-block">
              <span className="info-block-label">End Date</span>
              <span className="info-block-value">
                {formatDate(campaign.endDate)}
              </span>
            </div>
          </div>

          {/* === Section 3: Statistics === */}
          <h3 className="campaign-section-title">Campaign Statistics</h3>
          <div className="campaign-info-row">
            <div className="campaign-info-block stat-block">
              <span className="info-block-label">Affected</span>
              {/* Tổng xe bị ảnh hưởng bởi chiến dịch */}
              <span className="info-block-value large-stat">
                {campaign.totalAffectedVehicles || 0}
              </span>
            </div>
            <div className="campaign-info-block stat-block">
              <span className="info-block-label">Scheduled</span>
              {/* pendingVehicles = scheduled but not started */}
              <span className="info-block-value large-stat">
                {campaign.pendingVehicles || 0}
              </span>
            </div>
            <div className="campaign-info-block stat-block">
              <span className="info-block-label">In Progress</span>
              <span className="info-block-value large-stat">
                {campaign.inProgressVehicles || 0}
              </span>
            </div>
            <div className="campaign-info-block stat-block">
              <span className="info-block-label">Completed</span>
              <span className="info-block-value large-stat">
                {campaign.completedVehicles || 0}
              </span>
            </div>
          </div>

          {/* === Footer === */}
          <div className="campaign-footer">
            <Button variant="secondary" onClick={onClose}>
              Back
            </Button>
            {/* Nếu campaign chưa đóng thì cho phép nút Close Campaign */}
            {campaign.status?.toLowerCase() !== "closed" && (
              <Button variant="danger" onClick={() => setShowConfirm(true)}>
                Close Campaign
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Close Campaign"
        message="Are you sure you want to close this campaign?"
        onConfirm={handleCloseCampaign}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

ViewCampaignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  campaign: PropTypes.object,
  onCloseCampaign: PropTypes.func,
};

export default ViewCampaignModal;
