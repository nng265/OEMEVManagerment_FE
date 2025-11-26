import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
import "./UnderInspectionModal.css";

export const UnderInspectionModal = ({
  isOpen,
  onClose,
  warrantyData,
  assignedTechnicians = [],
  loadingAssignedTechs = false,
  technicians = [],
  onFetchTechnicians,
  loadingTechnicians = false,
  onReassignSubmit,
}) => {
  const [editingTechId, setEditingTechId] = useState(null); // tech đang edit
  const [editingSelectedTechId, setEditingSelectedTechId] = useState(""); // tech được chọn khi edit
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (
      isOpen &&
      typeof onFetchTechnicians === "function" &&
      (!technicians || technicians.length === 0)
    ) {
      onFetchTechnicians();
    }
  }, [isOpen, onFetchTechnicians, technicians]);

  const handleSaveEdit = async () => {
    if (!editingSelectedTechId) return;
    if (!warrantyData || !warrantyData.claimId) return;
    if (typeof onReassignSubmit !== "function") return;
    setIsSubmitting(true);
    try {
      await onReassignSubmit(warrantyData.claimId, [editingSelectedTechId]);
      setEditingTechId(null);
      setEditingSelectedTechId("");
    } finally {
      setIsSubmitting(false);
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
              <div className="technician-meta">
                <div className="technician-icon">👤</div>
                <div className="technician-name">{tech.name}</div>
              </div>

              <div className="technician-actions">
                {editingTechId === tech.userId ? (
                  <div className="edit-controls">
                    <select
                      value={editingSelectedTechId}
                      onChange={(e) => setEditingSelectedTechId(e.target.value)}
                      disabled={loadingTechnicians}
                    >
                      <option value="">-- Select technician --</option>
                      {technicians.map((t) => (
                        <option key={t.userId || t.id} value={t.userId || t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveEdit}
                      disabled={isSubmitting || !editingSelectedTechId}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditingTechId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-link edit-btn"
                    onClick={() => {
                      setEditingTechId(tech.userId);
                      setEditingSelectedTechId(tech.userId);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-technicians">No technicians assigned yet.</p>
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
    />
  );
};

UnderInspectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  assignedTechnicians: PropTypes.array,
  loadingAssignedTechs: PropTypes.bool,
  technicians: PropTypes.array,
  onFetchTechnicians: PropTypes.func,
  loadingTechnicians: PropTypes.bool,
  onReassignSubmit: PropTypes.func,
};
