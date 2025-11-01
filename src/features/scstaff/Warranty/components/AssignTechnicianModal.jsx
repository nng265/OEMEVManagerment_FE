// AssignTechnicianModal.jsx

import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/atoms/Button/Button";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";


export const AssignTechnicianModal = (props) => {
  const isOpen = props.isOpen ?? props.show ?? false;
  const onClose = props.onClose ?? props.onHide ?? (() => {});
  const { claimData, onSubmit } = props;

  const [technicians, setTechnicians] = useState([{ id: 1 }]);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await request(ApiEnum.GET_TECHNICIANS);

        if (response.success) {
          // Remove role filter as agreed
          const techList = response.data;
          setAvailableTechs(techList);
        } else {
          setError("Unable to load technician list");
        }
      } catch (err) {
        console.error("Error fetching technicians:", err);
        setError("An error occurred while loading technician list");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchTechnicians();
      setTechnicians([{ id: 1 }]); // Reset to 1 technician on open
    }
  }, [isOpen]);

  const handleAddTechnician = () => {
    const newId = (technicians[technicians.length - 1]?.id || 0) + 1;
    setTechnicians([...technicians, { id: newId }]);
  };

  const handleRemoveTechnician = (id) => {
    if (technicians.length > 1) {
      setTechnicians(technicians.filter((tech) => tech.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const assignedTechnicianIds = technicians
      .map((tech) => tech.selectedValue)
      .filter(Boolean);

    if (assignedTechnicianIds.length === 0) {
      setError("Please select at least one technician.");
      return;
    }

    const formData = {
      technicians: assignedTechnicianIds,
    };
    onSubmit(formData);
  };

  // --- THAY ĐỔI MỚI: TÍNH TOÁN CÁC ID ĐÃ CHỌN ---
  // Lấy danh sách tất cả các userId đã được chọn trong các dropdown
  const selectedIds = technicians.map((t) => t.selectedValue).filter(Boolean);

  if (!claimData) return null;

  // Details for Technician Section
  const detailsForTechnicianSection = claimData.notes && (
    <DetailSection title="Details for Technician">
      <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div className="detail-item">
          <span
            className="value"
            style={{ whiteSpace: "pre-wrap", color: "#2d3748" }}
          >
            {claimData.notes}
          </span>
        </div>
      </div>
    </DetailSection>
  );

  // Assign Technician Section
  const assignTechnicianSection = (
    <DetailSection title="Assign Technician">
      <div className="technicians-section">
        {technicians.map((tech) => (
          <div key={tech.id} className="technician-row">
            {loading ? (
              <div className="select-loading">Loading...</div>
            ) : (
              <select
                className="form-select tech-select"
                value={tech.selectedValue || ""}
                onChange={(e) => {
                  const updatedTechs = technicians.map((t) =>
                    t.id === tech.id
                      ? { ...t, selectedValue: e.target.value }
                      : t
                  );
                  setTechnicians(updatedTechs);
                }}
                required
              >
                <option value="">Select Technician</option>

                {availableTechs.map((techOpt) => {
                  // Filter condition to display technician:
                  // 1. Technician NOT selected (not in 'selectedIds')
                  //    OR
                  // 2. Technician IS selected by THIS dropdown
                  const isAvailable =
                    !selectedIds.includes(techOpt.userId) ||
                    techOpt.userId === tech.selectedValue;

                  return isAvailable ? (
                    <option key={techOpt.userId} value={techOpt.userId}>
                      {techOpt.name}
                    </option>
                  ) : null;
                })}
              </select>
            )}
            {technicians.length > 1 && (
              <Button
                type="button"
                variant="danger"
                size="small"
                onClick={() => handleRemoveTechnician(tech.id)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={handleAddTechnician}
          className="mt-2"
        >
          Add Technician
        </Button>
        {error && !loading && (
          <div
            className="select-error"
            style={{ marginTop: "10px", color: "red" }}
          >
            {error}
          </div>
        )}
      </div>
    </DetailSection>
  );

  return (
    <form onSubmit={handleSubmit}>
      <WarrantyClaimDetailModal
        isOpen={isOpen}
        onClose={onClose}
        warrantyData={claimData}
        title={`Assign Technician - ${
          claimData.status || "Waiting for Unassigned"
        }`}
        showBackButton={true}
        backButtonLabel="Cancel"
        additionalContent={
          <>
            {detailsForTechnicianSection}
            {assignTechnicianSection}
          </>
        }
      >
        <Button variant="primary" type="submit">
          Assign
        </Button>
      </WarrantyClaimDetailModal>
    </form>
  );
};

export default AssignTechnicianModal;
