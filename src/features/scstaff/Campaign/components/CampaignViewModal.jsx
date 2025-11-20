import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import "./CampaignViewModal.css";

export const CampaignViewModal = ({ isOpen, onClose, campaign }) => {
  if (!campaign) return null;

  console.log("Campaign data in Modal:", campaign);

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
      <div className="campaign-modal">
        <h3 className="campaign-section-title">Campaign Information</h3>
        <div className="campaign-info-row">
          <div className="campaign-info-block full-width">
            <span className="info-block-label">Description</span>
            <span className="info-block-value">{campaign.description}</span>
          </div>
        </div>

        <h3 className="campaign-section-title">Campaign Details</h3>
        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Campaign Type</span>
            <span className="info-block-value">{campaign.type}</span>
          </div>

          <div className="campaign-info-block">
            <span className="info-block-label">Target Part</span>
            <span className="info-block-value">{campaign.partModel}</span>
          </div>
        </div>
        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Start Date</span>
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

        <h3 className="campaign-section-title">Campaign Statistics</h3>
        <div className="campaign-info-row">
          <div className="campaign-info-block stat-block">
            <span className="info-block-label">Scheduled</span>
            <span className="info-block-value large-stat">
              {campaign.pendingVehicles}
            </span>
          </div>

          <div className="campaign-info-block stat-block">
            <span className="info-block-label">In Progress</span>
            <span className="info-block-value large-stat">
              {campaign.inProgressVehicles}
            </span>
          </div>

          <div className="campaign-info-block stat-block">
            <span className="info-block-label">Completed</span>
            <span className="info-block-value large-stat">
              {campaign.completedVehicles}
            </span>
          </div>
        </div>

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
