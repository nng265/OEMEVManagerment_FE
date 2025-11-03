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
      console.warn(" Missing campaign id", campaign);
      return;
    }
    onCloseCampaign?.(campaignId);
    setShowConfirm(false);
    onClose();
  };

  return (
    <>
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

          {/* Info */}
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
            {["affected", "scheduled", "inProgress", "completed"].map((key) => (
              <div key={key} className="campaign-summary-card">
                <p className="label">
                  {key === "inProgress"
                    ? "In Progress"
                    : key === "affected"
                    ? "Affected Customers"
                    : key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
                <p className="value">{stats[key]}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-left">
              <Button variant="secondary" onClick={onClose}>
                Back
              </Button>
            </div>

            {campaign.status?.toLowerCase() !== "closed" && (
              <div className="footer-right">
                <Button variant="danger" onClick={() => setShowConfirm(true)}>
                  Close Campaign
                </Button>
              </div>
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
