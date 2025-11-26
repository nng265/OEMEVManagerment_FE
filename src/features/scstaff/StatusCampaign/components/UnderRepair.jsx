import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import "../components/UI.css";

const UnderRepair = ({ open, onClose, data }) => {
  const [assignedTechs, setAssignedTechs] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [techError, setTechError] = useState(null);

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

  // Fetch assigned technicians when modal opens
  useEffect(() => {
    if (open && data?.id) {
      const fetchAssignedTechs = async () => {
        try {
          setLoadingTechs(true);
          setTechError(null);
          const endpoint = ApiEnum.CAMPAIGN_VEHICLE_TECH.path.replace(
            ":campaignVehicleId",
            data.id
          );
          const response = await request(endpoint);
          if (response && response.success) {
            setAssignedTechs(response.data || []);
          } else {
            setTechError("Unable to load technicians");
          }
        } catch (err) {
          console.error("Error fetching assigned technicians:", err);
          setTechError("Error loading technicians");
        } finally {
          setLoadingTechs(false);
        }
      };
      fetchAssignedTechs();
    } else {
      setAssignedTechs([]);
      setTechError(null);
    }
  }, [open, data?.id]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={campaign ? `Vehicle - ${campaign.status}` : "UnderRepair Details"}
      size="lg"
      showFooter={false}
    >
      <div className="campaign-modal">
        {/* === Section 1: Thông tin Khách hàng & Xe === */}
        <h3 className="campaign-section-title">Customer</h3>
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

        <h3 className="campaign-section-title">Vehicle Information</h3>
        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Model</span>
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

        {/* === Section 3: Assigned Technicians === */}
        <h3 className="campaign-section-title">Assigned Technicians</h3>
        {loadingTechs ? (
          <p className="loading-text">Loading assigned technicians...</p>
        ) : techError ? (
          <p style={{ color: "red" }}>{techError}</p>
        ) : assignedTechs.length > 0 ? (
          <div className="technicians-list">
            {assignedTechs.map((tech, index) => (
              <div key={tech.userId || index} className="technician-item">
                <div className="technician-icon">👤</div>
                <div className="technician-info">
                  <span className="technician-name">{tech.name}</span>
                  <span className="technician-email">{tech.email}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-technicians">No technicians assigned yet.</p>
        )}

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
