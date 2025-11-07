import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import "../components/UI.css";

const UnderRepair = ({ open, onClose, data }) => {
  // === Dùng các hàm helper giống CampaignViewModal ===
  const displayValue = (value) => {
    if (value === 0 || value === null || value === undefined || value === "") {
      return "—";
    }
    return value;
  };
  // ===================================================

  const campaign = data?.raw ?? {};
  const vehicle = campaign.vehicle ?? {};
  const customer = campaign.customer ?? {};

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Vehicle Under Repair"
      size="xl"
      showFooter={false}
    >
      <div className="campaign-modal">
        {/* === Section 1: Thông tin Khách hàng & Xe === */}
        <h3 className="campaign-section-title">
          Customer & Vehicle Information
        </h3>
        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Customer Name</span>
            <span className="info-block-value">
              {displayValue(customer.name)}
            </span>
          </div>
          <div className="campaign-info-block">
            <span className="info-block-label">Phone</span>
            <span className="info-block-value">
              {displayValue(customer.phone)}
            </span>
          </div>
        </div>
        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Vehicle Model</span>
            <span className="info-block-value">
              {displayValue(vehicle.model)}
            </span>
          </div>
          <div className="campaign-info-block">
            <span className="info-block-label">VIN</span>
            <span className="info-block-value">
              {displayValue(vehicle.vin)}
            </span>
          </div>
          <div className="campaign-info-block">
            <span className="info-block-label">Year</span>
            <span className="info-block-value">
              {displayValue(vehicle.year)}
            </span>
          </div>
        </div>

        {/* === Section 2: Thông tin Chiến dịch === */}
        <h3 className="campaign-section-title">Campaign Details</h3>
        <div className="campaign-info-row">
          <div className="campaign-info-block full-width">
            <span className="info-block-label">Title</span>
            <span className="info-block-value">
              {displayValue(campaign.title)}
            </span>
          </div>
        </div>
        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Status</span>
            <span className="info-block-value">
              {displayValue(campaign.status)}
            </span>
          </div>
          <div className="campaign-info-block">
            <span className="info-block-label">Campaign Type</span>
            <span className="info-block-value">
              {displayValue(campaign.type)}
            </span>
          </div>
          <div className="campaign-info-block">
            <span className="info-block-label">Description</span>
            <span className="info-block-value">
              {displayValue(campaign.description)}
            </span>
          </div>
        </div>

        {/* === Footer === */}
        <div className="campaign-footer">
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
        </div>
      </div>
    </Modal>
  );
};

UnderRepair.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
};

export default UnderRepair;
