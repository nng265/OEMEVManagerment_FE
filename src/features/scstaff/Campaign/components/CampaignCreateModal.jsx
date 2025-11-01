import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import "./CampaignCreateModal.css";

export const CampaignCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  campaignOptions = [],
  technicianOptions = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    vin: "",
    technicians: [],
    allowMultipleTech: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTechSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({
      ...prev,
      technicians: selected,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.type || formData.technicians.length === 0) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Create Campaign"
      onClose={onClose}
      showFooter={false}
      size="lg"
    >
      <form className="add-campaign-form" onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}

        <div className="form-group">
          <label>Campaign</label>
          <select name="title" value={formData.title} onChange={handleChange} required>
            <option value="" disabled>-- Select campaign --</option>
            {campaignOptions.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Campaign Type</label>
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option value="" disabled>-- Select type --</option>
            {[...new Set(campaignOptions.map((c) => c.type))].map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>VIN</label>
          <Input name="vin" value={formData.vin} onChange={handleChange} />
        </div>

        <div className="form-group toggle-row">
          <label>+ Add more technician</label>
          <input
            type="checkbox"
            name="allowMultipleTech"
            checked={formData.allowMultipleTech}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Select Technician *</label>
          <select
            name="technicians"
            value={formData.technicians}
            onChange={handleTechSelect}
            multiple={formData.allowMultipleTech}
            required
          >
            {technicianOptions.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Warranty Claim</Button>
        </div>
      </form>
    </Modal>
  );
};

CampaignCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  campaignOptions: PropTypes.array,
  technicianOptions: PropTypes.array,
};

export default CampaignCreateModal;
