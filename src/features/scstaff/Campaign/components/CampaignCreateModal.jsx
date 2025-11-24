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
  const [assignTechnicians, setAssignTechnicians] = useState(false);

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
      setAssignTechnicians(false);
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

  const handleAssignTechToggle = (e) => {
    const isChecked = e.target.checked;
    setAssignTechnicians(isChecked);
    // Luôn reset về 1 hàng rỗng khi toggle
    setSelectedTechs([""]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.vin || formData.vin.trim() === "") {
      setError("Vui lòng nhập số VIN hợp lệ.");
      return;
    }

    const validTechs = selectedTechs.filter(Boolean);

    if (!formData.campaignId || !formData.type) {
      setError("Vui lòng chọn Campaign và Campaign Type.");
      return;
    }

    if (assignTechnicians && validTechs.length === 0) {
      setError("Vui lòng chọn ít nhất một technician khi đã tick chọn.");
      return;
    }

    const uniqueValidTechs = [...new Set(validTechs)];

    onSubmit({
      ...formData,
      vin: formData.vin.trim(),
      technicians: assignTechnicians ? uniqueValidTechs : [],
    });
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

        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Target Part</span>
            <span className="info-block-value">
              {initialCampaign?.partModel}
            </span>
          </div>
        </div>
        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Start Date</span>
            <span className="info-block-value">
              {formatDate(initialCampaign?.startDate)}
            </span>
          </div>

          <div className="campaign-info-block">
            <span className="info-block-label">End Date</span>
            <span className="info-block-value">
              {formatDate(initialCampaign?.endDate)}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>VIN</label>
          <Input
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group-checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={assignTechnicians}
              onChange={handleAssignTechToggle}
            />
            Assign Technicians
          </label>
        </div>

        {assignTechnicians && (
          <div className="form-group technician-assignment-box">
            <label>Assigned Technicians List</label>

            {selectedTechs.map((currentTechValue, index) => {
              const otherSelectedIds = selectedTechs
                .filter((_, i) => i !== index) // Lọc bỏ hàng hiện tại
                .filter(Boolean); // Lọc bỏ các giá trị rỗng ""

              // Lọc danh sách technicianOptions
              // Chỉ giữ lại những tech CHƯA CÓ trong otherSelectedIds
              const availableOptions = technicianOptions.filter((t_option) => {
                const techId =
                  t_option.id ?? t_option.employeeId ?? t_option.userId;
                return !otherSelectedIds.includes(techId);
              });

              return (
                <div key={index} className="tech-select-row">
                  <select
                    value={currentTechValue} // Giá trị của hàng này
                    onChange={(e) => handleChangeTech(index, e.target.value)}
                    required
                  >
                    <option value="">Select technician...</option>

                    {availableOptions.map((t) => (
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
              );
            })}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddTech}
              style={{ marginTop: "8px" }}
            >
              + Add Technician
            </Button>
          </div>
        )}

        <div className="form-actions">
          <div className="left-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
          <div className="right-actions">
            <Button type="submit">Create Campaign</Button>
          </div>
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
  initialCampaignId: PropTypes.string,
  initialCampaign: PropTypes.object,
};

export default CampaignCreateModal;
