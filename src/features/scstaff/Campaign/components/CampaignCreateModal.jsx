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
  initialCampaignId = "",
  initialCampaign = null,
}) => {
  const [formData, setFormData] = useState({
    campaignId: initialCampaignId || "",
    type: initialCampaign?.type ?? "",
    vin: "",
  });

  const [selectedTechs, setSelectedTechs] = useState([""]);
  const [error, setError] = useState("");

  // when modal opens or initialCampaign changes, prefill fields
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        campaignId:
          (initialCampaign &&
            (initialCampaign.campaignId ?? initialCampaign.id)) ||
          initialCampaignId ||
          "",
        type: initialCampaign?.type ?? "",
        vin: "",
      });
      setSelectedTechs([""]);
      setError("");
    }
  }, [isOpen, initialCampaign, initialCampaignId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTech = () => setSelectedTechs((s) => [...s, ""]);
  const handleChangeTech = (index, value) => {
    const updated = [...selectedTechs];
    updated[index] = value;
    setSelectedTechs(updated);
  };
  const handleRemoveTech = (index) => {
    setSelectedTechs((s) => s.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validTechs = selectedTechs.filter(Boolean);
    if (!formData.campaignId || !formData.type || validTechs.length === 0) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    onSubmit({ ...formData, technicians: validTechs });
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
          {initialCampaign ? (
            /* ===== THAY ĐỔI 1 ===== */
            <div className="form-display-value">
              {initialCampaign.title ?? initialCampaign.name ?? "—"}
            </div>
          ) : (
            <select
              name="campaignId"
              value={formData.campaignId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                -- Select campaign --
              </option>
              {campaignOptions.map((c) => (
                <option key={c.campaignId ?? c.id} value={c.campaignId ?? c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label>Campaign Type</label>
          {initialCampaign ? (
            /* ===== THAY ĐỔI 2 ===== */
            <div className="form-display-value">
              {initialCampaign.type ?? "—"}
            </div>
          ) : (
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                -- Select type --
              </option>
              {[...new Set(campaignOptions.map((c) => c.type))].map(
                (type, i) => (
                  <option key={i} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          )}
        </div>

        <div className="form-group">
          <label>VIN</label>
          <Input name="vin" value={formData.vin} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Select Technician *</label>
          {selectedTechs.map((tech, index) => (
            /* ===== THAY ĐỔI 3 (div bên ngoài) ===== */
            <div key={index} className="tech-select-row">
              <select
                value={tech}
                onChange={(e) => handleChangeTech(index, e.target.value)}
                /* ===== THAY ĐỔI 3 (đã xóa style khỏi select) ===== */
                required
              >
                <option value="">Select technician...</option>
                {technicianOptions.map((t) => (
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
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Campaign</Button>
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
