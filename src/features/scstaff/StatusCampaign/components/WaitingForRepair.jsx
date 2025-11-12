import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { toast } from "react-toastify";
import "../components/UI.css";

const WaitingForRepair = ({ open, onClose, data, onSuccess }) => {
  const [techs, setTechs] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState([""]);
  const [assigning, setAssigning] = useState(false);
  const [loadingTechs, setLoadingTechs] = useState(false);

  // === Dùng các hàm helper giống CampaignViewModal ===
  const displayValue = (value) => {
    if (value === 0 || value === null || value === undefined || value === "") {
      return "—";
    }
    return value;
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
  // ===================================================

  const campaign = data?.raw ?? {};
  const vehicle = campaign.vehicle ?? {};
  const customer = campaign.customer ?? {};

  // === Load technicians ===
  useEffect(() => {
    if (open) {
      let mounted = true;
      const loadTechs = async () => {
        setLoadingTechs(true);
        try {
          const res = await request(ApiEnum.GET_TECHNICIANS, {});
          const list = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.items)
            ? res.items
            : [];
          if (mounted) setTechs(list);
        } catch (err) {
          console.error("Failed to load technicians", err);
          if (mounted) toast.error("Failed to load technicians");
        } finally {
          if (mounted) setLoadingTechs(false);
        }
      };
      loadTechs();
      return () => {
        mounted = false;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelectedTechs([""]);
    }
  }, [open]);

  const handleAddTech = () => {
    setSelectedTechs((prev) => [...prev, ""]);
  };

  const handleChangeTech = (index, value) => {
    const updated = [...selectedTechs];
    updated[index] = value;
    setSelectedTechs(updated);
  };

  const handleRemoveTech = (index) => {
    const updated = selectedTechs.filter((_, i) => i !== index);
    setSelectedTechs(updated);
  };

  // === Confirm assign ===
  const handleAssignClick = async () => {
    const id = campaign.campaignVehicleId ?? campaign.id;
    if (!id) {
      toast.warn("Missing campaign vehicle ID");
      return;
    }
    const validTechs = selectedTechs.filter(Boolean);
    if (validTechs.length === 0) {
      toast.warn("Please select at least one technician");
      return;
    }
    setAssigning(true);
    try {
      const res = await request(ApiEnum.CAMPAIGNVEHICLE_STAFF_TECH, {
        params: { id },
        assignedTo: validTechs,
      });

      if (res?.success !== false) {
        toast.success("Technician(s) assigned successfully!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Assignment failed.");
      }
    } catch (err) {
      console.error("Assign failed:", err);
      const msg =
        err?.responseData?.message ||
        err?.message ||
        "System or network error during assignment.";
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Assign Technician"
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

        <hr />

        <h3 className="campaign-section-title">Campaign Information</h3>
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
            <span className="info-block-label">Description</span>
            <span className="info-block-value">
              {displayValue(campaign.description)}
            </span>
          </div>
          <div className="campaign-info-block">
            <span className="info-block-label">Type</span>
            <span className="info-block-value">
              {displayValue(campaign.type)}
            </span>
          </div>
        </div>
        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Period</span>
            <span className="info-block-value">
              {campaign.startDate && campaign.endDate
                ? `${formatDate(campaign.startDate)} – ${formatDate(
                    campaign.endDate
                  )}`
                : "—"}
            </span>
          </div>
          <div className="campaign-info-block">
            <span className="info-block-label">Part</span>
            <span className="info-block-value">
              {displayValue(campaign.partModel)}
            </span>
          </div>
        </div>

        <hr />

        {/* === Section 3: Chỉ định Kỹ thuật viên === */}
        <h3 className="campaign-section-title">Assign Technician *</h3>
        <div className="form-group">
          {loadingTechs ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {selectedTechs.map((tech, index) => (
                <div key={index} className="tech-select-row">
                  <select
                    value={tech}
                    onChange={(e) => handleChangeTech(index, e.target.value)}
                  >
                    <option value="">Select technician...</option>
                    {techs.map((t) => (
                      <option
                        key={t.id ?? t.employeeId ?? t.userId}
                        value={t.id ?? t.employeeId ?? t.userId}
                      >
                        {t.name ?? t.fullName ?? t.username}
                      </option>
                    ))}
                  </select>
                  {selectedTechs.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveTech(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={handleAddTech}>
                + Add more technician
              </Button>
            </>
          )}
        </div>

        {/* === Footer === */}
        <div
          className="campaign-footer"
          style={{ justifyContent: "space-between" }}
        >
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignClick}
            disabled={assigning}
          >
            {assigning ? "Assigning..." : "Assign Technician"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

WaitingForRepair.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default WaitingForRepair;
