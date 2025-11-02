import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import "./CampaignViewModal.css";

export const CampaignViewModal = ({ isOpen, onClose, campaign }) => {
  if (!campaign) return null;

  // const stats = {
  //   scheduled: campaign._raw?.pendingVehicles ?? 0,
  //   inProgress: campaign._raw?.inProgressVehicles ?? 0,
  //   completed: campaign._raw?.completedVehicles ?? 0,
  //   affected: campaign._raw?.totalAffectedVehicles ?? 0,
  // };

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
            <span className="label">Campaign Type</span>
            <span className="value">{campaign.type}</span>
          </div>
          <div className="campaign-info-item">
            <span className="label">Target Part</span>
            <span className="value">{campaign.target || "—"}</span>
          </div>
          <div className="campaign-info-item">
            <span className="label">Campaign Period</span>
            <span className="value">{campaign.period}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="campaign-summary-grid">
          <div className="campaign-summary-card">
            <span className="label">Scheduled</span>
            <span className="value">{campaign.pendingVehicles}</span>
          </div>
          <div className="campaign-summary-card">
            <span className="label">In Progress</span>
            <span className="value">{campaign.inProgressVehicles}</span>
          </div>
          <div className="campaign-summary-card">
            <span className="label">Completed</span>
            <span className="value">{campaign.completedVehicles}</span>
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
