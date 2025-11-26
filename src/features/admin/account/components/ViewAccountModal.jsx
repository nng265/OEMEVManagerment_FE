import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import "./AccountModal.css";

export const ViewAccountModal = ({ isOpen, onClose, account }) => {
  if (!account) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account.email || "Account Detail"}
      size="xl"
      showFooter={false}
    >
      <div className="account-modal">
        <h3 className="account-section-title">Account Information</h3>

        <div className="account-info-row">
          <div className="account-info-block full-width">
            <span className="info-block-label">Email</span>
            <span className="info-block-value">{account.email}</span>
          </div>
        </div>

        <div className="account-info-row">
          <div className="account-info-block full-width">
            <span className="info-block-label">Role</span>
            <span className="info-block-value">{account.role}</span>
          </div>
        </div>

        <div className="account-info-row">
          <div className="account-info-block full-width">
            <span className="info-block-label">Organization</span>
            <span className="info-block-value">{account.organizationName}</span>
          </div>
        </div>

        <div className="account-info-row">
          <div className="account-info-block full-width">
            <span className="info-block-label">User ID</span>
            <span className="info-block-value">{account.userId}</span>
          </div>
        </div>

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
  account: PropTypes.object,
};

export default ViewAccountModal;
