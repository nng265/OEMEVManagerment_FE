import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import "./ViewCampaignModal.css";

export const ViewCampaignModal = ({ isOpen, onClose, campaign }) => {
  if (!campaign) return null;

  const stats = campaign._raw?.stats || {
    affected: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign.title || "Campaign Detail"}
      size="lg"
      showFooter={false}
    >
      <div className="campaign-modal">
        {/* Header */}
        <div className="campaign-header">
          <span className="label">Description: </span>
          <span className="value">{campaign.description}</span>
        </div>

        {/* Info section */}
        <div className="campaign-info">
          <div className="campaign-info-item">
            <span className="label">Campaign Type </span>
            <span className="value">{campaign.type}</span>
          </div>
          <div className="campaign-info-item">
            <span className="label">Target </span>
            <span className="value">{campaign.target}</span>
          </div>
          <div className="campaign-info-item">
            <span className="label">Campaign Period </span>
            <span className="value">{campaign.period}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="campaign-summary-grid">
          <div className="campaign-summary-card">
            <p className="label">Affected Customers</p>
            <p className="value">{stats.affected}</p>
          </div>
          <div className="campaign-summary-card">
            <p className="label">Scheduled</p>
            <p className="value">{stats.scheduled}</p>
          </div>
          <div className="campaign-summary-card">
            <p className="label">In Progress</p>
            <p className="value">{stats.inProgress}</p>
          </div>
          <div className="campaign-summary-card">
            <p className="label">Completed</p>
            <p className="value">{stats.completed}</p>
          </div>
        </div>

        {/* Footer  khi bấm close có mở xác nhận*/}
        <div className="right">
          <Button variant="secondary" onClick={onClose}>
            Close Campaign
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ViewCampaignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  campaign: PropTypes.object,
};

export default ViewCampaignModal;
