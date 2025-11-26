// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
// import { request, ApiEnum } from "../../../../services/NetworkUntil";
// import { toast } from "react-toastify";
// import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
// import "./UnderInspectionModal.css"; // dùng chung CSS luôn cho đồng nhất

// export const UnderRepairModal = ({
//   isOpen,
//   onClose,
//   warrantyData,
//   assignedTechnicians = [],
//   loadingAssignedTechs = false,
//   onReassignSuccess,
// }) => {
//   const [editingTechId, setEditingTechId] = useState(null);
//   const [editingSelectedTechId, setEditingSelectedTechId] = useState("");
//   const [availableTechs, setAvailableTechs] = useState([]);
//   const [loadingTechnicians, setLoadingTechnicians] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   useEffect(() => {
//     if (isOpen && editingTechId) {
//       fetchTechnicians();
//     }
//   }, [isOpen, editingTechId]);

//   const fetchTechnicians = async () => {
//     try {
//       setLoadingTechnicians(true);
//       const response = await request(ApiEnum.GET_TECHNICIANS);

//       if (response?.success) {
//         setAvailableTechs(response.data || []);
//       }
//     } finally {
//       setLoadingTechnicians(false);
//     }
//   };

//   const performReassign = async () => {
//     console.log("handleSaveEdit", { editingSelectedTechId, warrantyData });

//     if (!editingSelectedTechId) return;
//     // warrantyData may use `id` or `claimId` depending on caller; accept both
//     const targetId = warrantyData?.id ?? warrantyData?.claimId;
//     if (!warrantyData || !targetId) return;

//     const technicianIds = [editingSelectedTechId];
//     setIsSubmitting(true);

//     console.log("Submitting reassignment", { technicianIds, targetId });

//     try {
//       const body = {
//         target: "Warranty",
//         targetId,
//         technicianIds,
//       };

//       // Use ApiEnum endpoint so request helper applies correct method and base URL
//       const res = await request(ApiEnum.REASSIGN_TECHNICIAN, body);

//       if (res?.success) {
//         toast.success("Technician reassigned successfully!");
//         if (typeof onReassignSuccess === "function")
//           onReassignSuccess(res.data);
//         setEditingTechId(null);
//         setEditingSelectedTechId("");
//       } else {
//         console.error(res);
//         toast.error("Failed to reassign technician.");
//       }
//     } finally {
//       setIsSubmitting(false);
//       setShowConfirm(false);
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
//                       {availableTechs.map((t) => (
//                         <option key={t.userId || t.id} value={t.userId || t.id}>
//                           {t.name}
//                         </option>
//                       ))}
//                     </select>

//                     <button
//                       className="btn btn-primary"
//                       onClick={() => setShowConfirm(true)}
//                       disabled={isSubmitting || !editingSelectedTechId}
//                     >
//                       Save
//                     </button>

//                     <button
//                       className="btn btn-secondary"
//                       onClick={() => {
//                         setEditingTechId(null);
//                         setEditingSelectedTechId("");
//                       }}
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
//     <>
//       <WarrantyClaimDetailModal
//         isOpen={isOpen}
//         onClose={onClose}
//         warrantyData={warrantyData}
//         showBackButton={true}
//         backButtonLabel="Cancel"
//         additionalContent={assignedTechniciansSection}
//       />
//       <ConfirmDialog
//         isOpen={showConfirm}
//         title="Confirm Reassign"
//         message="Are you sure you want to reassign technician(s)?"
//         confirmLabel="Yes, Reassign"
//         cancelLabel="No"
//         onConfirm={performReassign}
//         onCancel={() => setShowConfirm(false)}
//         isLoading={isSubmitting}
//       />
//     </>
//   );
// };

// UnderRepairModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   warrantyData: PropTypes.object,
//   assignedTechnicians: PropTypes.array,
//   loadingAssignedTechs: PropTypes.bool,
//   onReassignSuccess: PropTypes.func,
// };

// select edit nhiều tech

// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
// import { request, ApiEnum } from "../../../../services/NetworkUntil";
// import { toast } from "react-toastify";
// import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
// import "./UnderInspectionModal.css"; // dùng chung CSS luôn cho đồng nhất

// export const UnderRepairModal = ({
//   isOpen,
//   onClose,
//   warrantyData,
//   assignedTechnicians = [],
//   loadingAssignedTechs = false,
//   onReassignSuccess,
// }) => {
//   const [editing, setEditing] = useState(false);
//   const [selectedTechIds, setSelectedTechIds] = useState([]);
//   const [availableTechs, setAvailableTechs] = useState([]);
//   const [loadingTechnicians, setLoadingTechnicians] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   useEffect(() => {
//     if (isOpen && editing) {
//       fetchTechnicians();
//     }
//   }, [isOpen, editing]);

//   const fetchTechnicians = async () => {
//     try {
//       setLoadingTechnicians(true);
//       const response = await request(ApiEnum.GET_TECHNICIANS);
//       if (response?.success) {
//         setAvailableTechs(response.data || []);
//       }
//     } finally {
//       setLoadingTechnicians(false);
//     }
//   };

//   const handleStartEdit = () => {
//     setEditing(true);
//     setSelectedTechIds(assignedTechnicians.map((t) => t.userId ?? t.id ?? ""));
//   };

//   const handleCancelEdit = () => {
//     setEditing(false);
//     setSelectedTechIds([]);
//   };

//   const performReassign = async () => {
//     if (!selectedTechIds.length) return;

//     const targetId = warrantyData?.id ?? warrantyData?.claimId;
//     if (!warrantyData || !targetId) return;

//     setIsSubmitting(true);

//     try {
//       const body = {
//         target: "Warranty",
//         targetId,
//         technicianIds: selectedTechIds,
//       };
//       const res = await request(ApiEnum.REASSIGN_TECHNICIAN, body);

//       if (res?.success) {
//         toast.success("Technicians reassigned successfully!");
//         if (typeof onReassignSuccess === "function")
//           onReassignSuccess(res.data);
//         handleCancelEdit();
//       } else {
//         console.error(res);
//         toast.error("Failed to reassign technicians.");
//       }
//     } finally {
//       setIsSubmitting(false);
//       setShowConfirm(false);
//     }
//   };

//   const assignedTechniciansSection = (
//     <div className="detail-section assigned-technicians-section">
//       <h4>Assigned Technicians</h4>

//       {loadingAssignedTechs ? (
//         <p className="loading-text">Loading assigned technicians...</p>
//       ) : assignedTechnicians.length > 0 ? (
//         <div className="technicians-list">
//           {!editing ? (
//             <>
//               {assignedTechnicians.map((tech, index) => (
//                 <div key={tech.userId || index} className="technician-item">
//                   <div className="technician-meta">
//                     <div className="technician-icon">👤</div>
//                     <div className="technician-name">{tech.name}</div>
//                   </div>
//                 </div>
//               ))}
//               <button className="edit-btn" onClick={handleStartEdit}>
//                 Edit Technicians
//               </button>
//             </>
//           ) : (
//             <div className="technician-actions edit-controls">
//               <select
//                 multiple
//                 value={selectedTechIds}
//                 disabled={loadingTechnicians}
//                 onChange={(e) => {
//                   const selected = Array.from(e.target.selectedOptions).map(
//                     (opt) => opt.value
//                   );
//                   setSelectedTechIds(selected);
//                 }}
//                 size={Math.min(availableTechs.length, 5)}
//               >
//                 {availableTechs.map((t) => (
//                   <option key={t.userId || t.id} value={t.userId || t.id}>
//                     {t.name}
//                   </option>
//                 ))}
//               </select>

//               <button
//                 className="btn btn-primary"
//                 onClick={() => setShowConfirm(true)}
//                 disabled={!selectedTechIds.length || isSubmitting}
//               >
//                 Save
//               </button>
//               <button className="btn btn-secondary" onClick={handleCancelEdit}>
//                 Cancel
//               </button>
//             </div>
//           )}
//         </div>
//       ) : (
//         <p className="no-technicians">No technicians assigned yet.</p>
//       )}
//     </div>
//   );

//   return (
//     <>
//       <WarrantyClaimDetailModal
//         isOpen={isOpen}
//         onClose={onClose}
//         warrantyData={warrantyData}
//         showBackButton={true}
//         backButtonLabel="Cancel"
//         additionalContent={assignedTechniciansSection}
//       />
//       <ConfirmDialog
//         isOpen={showConfirm}
//         title="Confirm Reassign"
//         message="Are you sure you want to reassign selected technician(s)?"
//         confirmLabel="Yes, Reassign"
//         cancelLabel="No"
//         onConfirm={performReassign}
//         onCancel={() => setShowConfirm(false)}
//         isLoading={isSubmitting}
//       />
//     </>
//   );
// };

// UnderRepairModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   warrantyData: PropTypes.object,
//   assignedTechnicians: PropTypes.array,
//   loadingAssignedTechs: PropTypes.bool,
//   onReassignSuccess: PropTypes.func,
// };

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./UnderInspectionModal.css"; // dùng chung CSS

export const UnderRepairModal = ({
  isOpen,
  onClose,
  warrantyData,
  assignedTechnicians = [],
  loadingAssignedTechs = false,
  onReassignSuccess,
}) => {
  const [editing, setEditing] = useState(false);
  const [selectedTechIds, setSelectedTechIds] = useState([]);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && editing) {
      fetchTechnicians();
    }
  }, [isOpen, editing]);

  const fetchTechnicians = async () => {
    try {
      setLoadingTechnicians(true);
      const response = await request(ApiEnum.GET_TECHNICIANS);
      if (response?.success) setAvailableTechs(response.data || []);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const handleStartEdit = () => {
    setEditing(true);
    setSelectedTechIds(assignedTechnicians.map((t) => t.userId ?? t.id ?? ""));
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setSelectedTechIds([]);
  };

  const performReassign = async () => {
    if (!selectedTechIds.length) return;
    const targetId = warrantyData?.id ?? warrantyData?.claimId;
    if (!warrantyData || !targetId) return;

    setIsSubmitting(true);
    try {
      const body = {
        target: "Warranty",
        targetId,
        technicianIds: selectedTechIds,
      };
      const res = await request(ApiEnum.REASSIGN_TECHNICIAN, body);
      if (res?.success) {
        toast.success("Technicians reassigned successfully!");
        onReassignSuccess?.(res.data);
        handleCancelEdit();
      } else {
        toast.error("Failed to reassign technicians.");
      }
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const assignedTechniciansSection = (
    <div className="detail-section assigned-technicians-section">
      <h4>Assigned Technicians</h4>

      {loadingAssignedTechs ? (
        <p className="loading-text">Loading assigned technicians...</p>
      ) : assignedTechnicians.length > 0 ? (
        <div className="technicians-list">
          {/* Hiển thị danh sách tech */}
          {assignedTechnicians.map((tech, index) => (
            <div key={tech.userId || index} className="technician-item">
              <div className="technician-meta">
                <div className="technician-icon">👤</div>
                <div className="technician-name">{tech.name}</div>
              </div>
            </div>
          ))}

          {/* Nút edit */}
          {!editing && (
            <button className="edit-btn" onClick={handleStartEdit}>
              Edit Technicians
            </button>
          )}

          {/* Section edit: badges + dropdown + buttons */}
          {editing && (
            <div className="edit-section">
              <div className="selected-techs">
                {selectedTechIds.map((id) => {
                  const tech = availableTechs.find(
                    (t) => (t.userId || t.id) === id
                  );
                  return (
                    <span key={id} className="tech-badge">
                      {tech?.name || "—"}
                    </span>
                  );
                })}
              </div>

              <select
                multiple
                value={selectedTechIds}
                disabled={loadingTechnicians}
                onChange={(e) =>
                  setSelectedTechIds(
                    Array.from(e.target.selectedOptions).map((opt) => opt.value)
                  )
                }
                size={Math.min(availableTechs.length, 5)}
              >
                {availableTechs.map((t) => (
                  <option key={t.userId || t.id} value={t.userId || t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <div className="edit-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowConfirm(true)}
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
    <>
      <WarrantyClaimDetailModal
        isOpen={isOpen}
        onClose={onClose}
        warrantyData={warrantyData}
        showBackButton={true}
        backButtonLabel="Cancel"
        additionalContent={assignedTechniciansSection}
      />

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Reassign"
        message="Are you sure you want to reassign selected technician(s)?"
        confirmLabel="Yes, Reassign"
        cancelLabel="No"
        onConfirm={performReassign}
        onCancel={() => setShowConfirm(false)}
        isLoading={isSubmitting}
      />
    </>
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
