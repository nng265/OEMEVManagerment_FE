import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import "./UnderInspectionModal.css"; // dùng chung CSS luôn cho đồng nhất

export const UnderRepairModal = ({
  isOpen,
  onClose,
  warrantyData,
  assignedTechnicians = [],
  loadingAssignedTechs = false,
  onReassignSuccess,
}) => {
  const [editingTechId, setEditingTechId] = useState(null);
  const [editingSelectedTechId, setEditingSelectedTechId] = useState("");
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && editingTechId) {
      fetchTechnicians();
    }
  }, [isOpen, editingTechId]);

  const fetchTechnicians = async () => {
    try {
      setLoadingTechnicians(true);
      const response = await request(ApiEnum.GET_TECHNICIANS);

      if (response?.success) {
        setAvailableTechs(response.data || []);
      }
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSelectedTechId) return;
    if (!warrantyData || !warrantyData.id) return;

    const technicianIds = [editingSelectedTechId];
    setIsSubmitting(true);

    try {
      const body = {
        target: "Warranty",
        targetId: warrantyData.id,
        technicianIds,
      };

      const res = await request("/WorkOrder/reassign", body, {
        method: "POST",
      });

      if (res?.success) {
        if (typeof onReassignSuccess === "function")
          onReassignSuccess(res.data);
        setEditingTechId(null);
        setEditingSelectedTechId("");
      } else {
        console.error(res);
      }
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
                      {availableTechs.map((t) => (
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
                      onClick={() => {
                        setEditingTechId(null);
                        setEditingSelectedTechId("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className=" edit-btn"
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

UnderRepairModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  assignedTechnicians: PropTypes.array,
  loadingAssignedTechs: PropTypes.bool,
  onReassignSuccess: PropTypes.func,
};
