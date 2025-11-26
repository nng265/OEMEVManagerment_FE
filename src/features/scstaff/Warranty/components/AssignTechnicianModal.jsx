import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/atoms/Button/Button";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";

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
      setTechnicians([{ id: 1 }]);
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

  const selectedIds = technicians.map((t) => t.selectedValue).filter(Boolean);

  if (!claimData) return null;

  const detailsForTechnicianSection = claimData.notes && (
    <DetailSection title="Details for Staff">
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

  const assignTechnicianSection = (
    <DetailSection title="Assign Technician">
      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "20px" }}
        >
          <LoadingSpinner />
        </div>
      ) : (
        <div className="technicians-section">
          {technicians.map((tech) => (
            <div key={tech.id} className="technician-row">
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
          {/* <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={handleAddTechnician}
            className="mt-2"
          >
            Add Technician
          </Button> */}
          {error && (
            <div
              className="select-error"
              style={{ marginTop: "10px", color: "red" }}
            >
              {error}
            </div>
          )}
        </div>
      )}
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
