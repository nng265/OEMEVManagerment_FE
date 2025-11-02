import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import "../components/UI.css"; // THAY ĐỔI: Import CSS mới

const Done = ({ open, onClose, data }) => {
  // === Dùng các hàm helper giống CampaignViewModal ===
  const displayValue = (value) => {
    if (value === 0 || value === null || value === undefined || value === "") {
      return "—";
    }
    return value;
  };
  // ===================================================

  const campaign = data?.raw ?? {};
  const customer = campaign.customer ?? {};
  const vehicle = campaign.vehicle ?? {};
  const replacements = campaign.replacements ?? [];

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Campaign Done"
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

        {/* === Section 3: Linh kiện thay thế === */}
        <h3 className="campaign-section-title">Parts Replacement</h3>
        <div className="campaign-info-block full-width">
          {replacements.length > 0 ? (
            <table className="replacement-table">
              <thead>
                <tr>
                  <th>Old Serial</th>
                  <th>New Serial</th>
                </tr>
              </thead>
              <tbody>
                {replacements.map((rep, idx) => (
                  <tr key={idx}>
                    <td>{displayValue(rep.oldSerial)}</td>
                    <td>{displayValue(rep.newSerial)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span className="info-block-value">— No replacement data —</span>
          )}
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

Done.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
};

export default Done;
