// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
// import "./UnderInspectionModal.css";

// export const UnderInspectionModal = ({
//   isOpen,
//   onClose,
//   warrantyData,
//   assignedTechnicians = [],
//   loadingAssignedTechs = false,
//   technicians = [],
//   onFetchTechnicians,
//   loadingTechnicians = false,
//   onReassignSubmit,
// }) => {
//   const [editingTechId, setEditingTechId] = useState(null);
//   const [editingSelectedTechId, setEditingSelectedTechId] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (
//       isOpen &&
//       typeof onFetchTechnicians === "function" &&
//       (!technicians || technicians.length === 0)
//     ) {
//       onFetchTechnicians();
//     }
//   }, [isOpen, onFetchTechnicians, technicians]);

//   const handleSaveEdit = async () => {
//     if (!editingSelectedTechId) return;
//     if (!warrantyData || !warrantyData.claimId) return;
//     if (typeof onReassignSubmit !== "function") return;
//     setIsSubmitting(true);
//     try {
//       await onReassignSubmit(warrantyData.claimId, [editingSelectedTechId]);
//       setEditingTechId(null);
//       setEditingSelectedTechId("");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const assignedTechniciansSection = (
//     <div className="detail-section assigned-technicians-section">
//       <h4>Assigned Technicians</h4>
//       {loadingAssignedTechs ? (
//         <p className="loading-text">Loading assigned technicians...</p>
//       ) : assignedTechnicians.length > 0 ? (
//         <div className="technicians-list">
//           {assignedTechnicians.map((tech, index) => (
//             <div key={tech.userId || index} className="technician-item">
//               <div className="technician-meta">
//                 <div className="technician-icon">👤</div>
//                 <div className="technician-name">{tech.name}</div>
//               </div>

//               <div className="technician-actions">
//                 {editingTechId === tech.userId ? (
//                   <div className="edit-controls">
//                     <select
//                       value={editingSelectedTechId}
//                       onChange={(e) => setEditingSelectedTechId(e.target.value)}
//                       disabled={loadingTechnicians}
//                     >
//                       <option value="">-- Select technician --</option>
//                       {technicians.map((t) => (
//                         <option key={t.userId || t.id} value={t.userId || t.id}>
//                           {t.name}
//                         </option>
//                       ))}
//                     </select>
//                     <button
//                       className="btn btn-primary"
//                       onClick={handleSaveEdit}
//                       disabled={isSubmitting || !editingSelectedTechId}
//                     >
//                       Save
//                     </button>
//                     <button
//                       className="btn btn-secondary"
//                       onClick={() => setEditingTechId(null)}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     className=" edit-btn"
//                     onClick={() => {
//                       setEditingTechId(tech.userId);
//                       setEditingSelectedTechId(tech.userId);
//                     }}
//                   >
//                     Edit
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="no-technicians">No technicians assigned yet.</p>
//       )}
//     </div>
//   );

//   return (
//     <WarrantyClaimDetailModal
//       isOpen={isOpen}
//       onClose={onClose}
//       warrantyData={warrantyData}
//       showBackButton={true}
//       backButtonLabel="Cancel"
//       additionalContent={assignedTechniciansSection}
//     />
//   );
// };

// UnderInspectionModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   warrantyData: PropTypes.object,
//   assignedTechnicians: PropTypes.array,
//   loadingAssignedTechs: PropTypes.bool,
//   technicians: PropTypes.array,
//   onFetchTechnicians: PropTypes.func,
//   loadingTechnicians: PropTypes.bool,
//   onReassignSubmit: PropTypes.func,
// };

// select edit nhiều tech
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
  const [editing, setEditing] = useState(false);
  const [selectedTechIds, setSelectedTechIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh sách kỹ thuật viên khi mở modal nếu chưa có
  useEffect(() => {
    if (
      isOpen &&
      typeof onFetchTechnicians === "function" &&
      (!technicians || technicians.length === 0)
    ) {
      onFetchTechnicians();
    }
  }, [isOpen, onFetchTechnicians, technicians]);

  const handleStartEdit = () => {
    setEditing(true);
    setSelectedTechIds(assignedTechnicians.map((t) => t.userId ?? t.id ?? ""));
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setSelectedTechIds([]);
  };

  const handleSaveEdit = async () => {
    if (!selectedTechIds.length) return;
    if (!warrantyData || !warrantyData.claimId) return;
    if (typeof onReassignSubmit !== "function") return;

    setIsSubmitting(true);
    try {
      await onReassignSubmit(warrantyData.claimId, selectedTechIds);
      handleCancelEdit();
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
          {/* {!editing ? (
            <>
              {assignedTechnicians.map((tech, index) => (
                <div key={tech.userId || index} className="technician-item">
                  <div className="technician-meta">
                    <div className="technician-icon">👤</div>
                    <div className="technician-name">{tech.name}</div>
                  </div>
                </div>
              ))}
              <button className="edit-btn" onClick={handleStartEdit}>
                Edit Technicians
              </button>
            </>
          ) : (
            <div className="technician-actions edit-controls">
              <select
                multiple
                value={selectedTechIds}
                disabled={loadingTechnicians}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(
                    (opt) => opt.value
                  );
                  setSelectedTechIds(selected);
                }}
              >
                {technicians.map((t) => (
                  <option key={t.userId || t.id} value={t.userId || t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-primary"
                onClick={handleSaveEdit}
                disabled={!selectedTechIds.length || isSubmitting}
              >
                Save
              </button>
              <button className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          )} */}

          {!editing ? (
            <>
              {assignedTechnicians.map((tech, index) => (
                <div key={tech.userId || index} className="technician-item">
                  <div className="technician-meta">
                    <div className="technician-icon">👤</div>
                    <div className="technician-name">{tech.name}</div>
                  </div>
                </div>
              ))}
              <button className="edit-btn" onClick={handleStartEdit}>
                Edit Technicians
              </button>
            </>
          ) : (
            <div className="edit-section">
              {/* Hiển thị badge các tech đang chọn */}
              <div className="selected-techs">
                {selectedTechIds.map((id) => {
                  const tech = technicians.find(
                    (t) => (t.userId || t.id) === id
                  );
                  return (
                    <span key={id} className="tech-badge">
                      {tech?.name || "—"}
                    </span>
                  );
                })}
              </div>

              {/* Dropdown nằm bên dưới */}
              <select
                multiple
                value={selectedTechIds}
                disabled={loadingTechnicians}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(
                    (opt) => opt.value
                  );
                  setSelectedTechIds(selected);
                }}
              >
                {technicians.map((t) => (
                  <option key={t.userId || t.id} value={t.userId || t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <div className="edit-buttons">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={!selectedTechIds.length || isSubmitting}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
