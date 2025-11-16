import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
// import "./AccountList.css"; // <-- Lỗi: Import sai CSS
import "./AccountModal.css"; // <-- Sửa: Nên dùng file CSS chung cho modal

export const ViewAccountModal = ({ isOpen, onClose, account }) => {
  if (!account) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account.email || "Account Detail"} // <-- Sửa: Dùng email làm tiêu đề
      size="xl" // <-- Sửa: "xl" là quá lớn, dùng "md" (medium)
      showFooter={false} // Dùng footer tùy chỉnh bên dưới
    >
      <div className="account-modal">
        {/* === Section 1: Account Information === */}
        <h3 className="account-section-title">Account Information</h3>

        {/* --- Hiển thị Email --- */}
        <div className="account-info-row">
          <div className="account-info-block full-width">
            <span className="info-block-label">Email</span>
            <span className="info-block-value">{account.email}</span>
          </div>
        </div>

        {/* --- Hiển thị Role --- */}
        <div className="account-info-row">
          <div className="account-info-block full-width">
            <span className="info-block-label">Role</span>
            <span className="info-block-value">{account.role}</span>
          </div>
        </div>

        {/* --- Hiển thị Organization --- */}
        <div className="account-info-row">
          <div className="account-info-block full-width">
            <span className="info-block-label">Organization</span>
            <span className="info-block-value">{account.organizationName}</span>
          </div>
        </div>

        {/* --- Hiển thị User ID (Tùy chọn) --- */}
        <div className="account-info-row">
          <div className="account-info-block full-width">
            <span className="info-block-label">User ID</span>
            <span className="info-block-value">{account.userId}</span>
          </div>
        </div>

        {/* (Đã xóa các section "Coverage Details" và "Conditions" bị thừa) */}

        {/* === Footer === */}
        <div className="account-footer">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ViewAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  account: PropTypes.object, // <-- Sửa: từ 'policy' thành 'account'
};

export default ViewAccountModal;
