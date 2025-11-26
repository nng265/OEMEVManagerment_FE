import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { Button } from "../../../../components/atoms/Button/Button";

export const UnderRepairModal = ({
  isOpen,
  onClose,
  warrantyData,
  assignedTechnicians = [],
  loadingAssignedTechs = false,
  onReassignSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [techSelections, setTechSelections] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && isEditing) {
      // fetch available technicians
      const fetchTechs = async () => {
        try {
          setLoadingTechs(true);
          setError(null);
          const response = await request(ApiEnum.GET_TECHNICIANS);
          if (response && response.success) {
            setAvailableTechs(response.data || []);
          } else {
            setError("Unable to load technicians");
          }
        } catch (err) {
          console.error(err);
          setError("Error loading technicians");
        } finally {
          setLoadingTechs(false);
        }
      };

      fetchTechs();
      // initialize selections to current assigned set (keep same count)
      const initial = assignedTechnicians.map((t, idx) => ({
        id: idx + 1,
        selectedValue: t.userId || "",
      }));
      setTechSelections(initial);
    }
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen, isEditing, assignedTechnicians]);

  const handleChange = (id, value) => {
    setTechSelections((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selectedValue: value } : p))
    );
  };

  const handleStartEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError(null);
    const technicianIds = techSelections.map((t) => t.selectedValue).filter(Boolean);

    // must match current assigned count
    if (technicianIds.length !== assignedTechnicians.length) {
      setError("Please select the same number of technicians as currently assigned.");
      return;
    }

    if (!warrantyData || !warrantyData.id) {
      setError("Invalid warranty target.");
      return;
    }

    try {
      setSubmitting(true);
      const body = {
        target: "Warranty",
        targetId: warrantyData.id,
        technicianIds,
      };

      const res = await request("/WorkOrder/reassign", body, { method: "POST" });

      if (res && res.success) {
        setIsEditing(false);
        if (typeof onReassignSuccess === "function") onReassignSuccess(res.data);
        // optionally close modal
        // onClose();
      } else {
        setError(res?.message || "Failed to reassign technicians");
      }
    } catch (err) {
      console.error(err);
      const msg = err?.responseData?.message || err?.message || "Network error";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const assignedTechniciansSection = (
    <div className="detail-section assigned-technicians-section">
      <h4>Assigned Technicians</h4>
      {loadingAssignedTechs ? (
        <p className="loading-text">Loading assigned technicians...</p>
      ) : assignedTechnicians.length > 0 ? (
        <div className="technicians-list">
          {assignedTechnicians.map((tech, index) => (
            <div key={tech.userId || index} className="technician-item">
              <div className="technician-icon">👤</div>
              <div className="technician-info">
                <span className="technician-name">{tech.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-technicians">No technicians assigned yet.</p>
      )}

      {!isEditing && (
        <div style={{ marginTop: "12px" }}>
          <Button variant="secondary" size="small" onClick={handleStartEdit}>
            Edit
          </Button>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginTop: "12px" }}>
            {loadingTechs ? (
              <p>Loading technicians...</p>
            ) : (
              <div className="technicians-edit-list">
                {techSelections.map((sel) => (
                  <div key={sel.id} style={{ marginBottom: "8px" }}>
                    <select
                      className="form-select tech-select"
                      value={sel.selectedValue}
                      onChange={(e) => handleChange(sel.id, e.target.value)}
                      required
                    >
                      <option value="">Select technician</option>
                      {availableTechs.map((opt) => {
                        const isSelectedElsewhere = techSelections
                          .filter((s) => s.id !== sel.id)
                          .some((s) => s.selectedValue === opt.userId);
                        // prevent selecting same tech twice
                        if (isSelectedElsewhere) return null;
                        return (
                          <option key={opt.userId} value={opt.userId}>
                            {opt.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ))}
              </div>
            )}
            {error && <div style={{ color: "red", marginTop: "8px" }}>{error}</div>}
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <Button type="submit" variant="primary" size="small" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="danger" size="small" onClick={handleCancelEdit} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <WarrantyClaimDetailModal
      isOpen={isOpen}
      onClose={onClose}
      warrantyData={warrantyData}
      showBackButton={true}
      backButtonLabel="Cancel"
      additionalContent={assignedTechniciansSection}
    ></WarrantyClaimDetailModal>
  );
};

UnderRepairModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  assignedTechnicians: PropTypes.array,
  loadingAssignedTechs: PropTypes.bool,
};
