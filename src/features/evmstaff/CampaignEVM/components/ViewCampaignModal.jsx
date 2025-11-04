import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./ViewCampaignModal.css";

export const ViewCampaignModal = ({
  isOpen,
  onClose,
  campaign,
  onCloseCampaign,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  if (!campaign) return null;

  const stats = campaign._raw?.stats || {
    affected: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
  };

  const campaignId =
    campaign._raw?.campaignId ||
    campaign._raw?.id ||
    campaign.campaignId ||
    campaign.id;

  const handleCloseCampaign = () => {
    if (!campaignId) {
      console.warn("Missing campaign id", campaign);
      return;
    }
    onCloseCampaign?.(campaignId);
    setShowConfirm(false);
    onClose();
  };

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
              <span className="info-block-value">{campaign.description}</span>
            </div>
          </div>

          {/* === Section 2: Details === */}
          <h3 className="campaign-section-title">Campaign Details</h3>
          <div className="campaign-info-row">
            <div className="campaign-info-block">
              <span className="info-block-label">Campaign Type</span>
              <span className="info-block-value">{campaign.type}</span>
            </div>
            <div className="campaign-info-block">
              <span className="info-block-label">Target Part</span>
              <span className="info-block-value">{campaign.target}</span>
            </div>
          </div>
          <div className="campaign-info-row">
            <div className="campaign-info-block">
              <span className="info-block-label">Period</span>
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
              <span className="info-block-value large-stat">
                {stats.affected}
              </span>
            </div>
            <div className="campaign-info-block stat-block">
              <span className="info-block-label">Scheduled</span>
              <span className="info-block-value large-stat">
                {stats.scheduled}
              </span>
            </div>
            <div className="campaign-info-block stat-block">
              <span className="info-block-label">In Progress</span>
              <span className="info-block-value large-stat">
                {stats.inProgress}
              </span>
            </div>
            <div className="campaign-info-block stat-block">
              <span className="info-block-label">Completed</span>
              <span className="info-block-value large-stat">
                {stats.completed}
              </span>
            </div>
          </div>

          {/* === Footer === */}
          <div className="campaign-footer">
            <Button variant="secondary" onClick={onClose}>
              Back
            </Button>
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
