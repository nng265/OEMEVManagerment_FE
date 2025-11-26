// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { Modal } from "../../../../components/molecules/Modal/Modal";
// import { Button } from "../../../../components/atoms/Button/Button";
// import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
// import { toast } from "react-toastify";
// import { request, ApiEnum } from "../../../../services/NetworkUntil";
// import "../components/UI.css";

// const UnderRepair = ({ open, onClose, data }) => {
//   const [assignedTechs, setAssignedTechs] = useState([]);
//   const [loadingTechs, setLoadingTechs] = useState(false);
//   const [techError, setTechError] = useState(null);

//   const [editingTechId, setEditingTechId] = useState(null);
//   const [editingSelectedTechId, setEditingSelectedTechId] = useState("");
//   const [availableTechs, setAvailableTechs] = useState([]);
//   const [loadingAvailableTechs, setLoadingAvailableTechs] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [showConfirm, setShowConfirm] = useState(false);

//   const displayValue = (value) => (!value && value !== 0 ? "—" : value);

//   const campaign = data?.raw ?? {};
//   const vehicle = campaign.vehicle ?? {};
//   const customer = campaign.customer ?? {};

//   useEffect(() => {
//     if (open && data?.id) {
//       fetchAssignedTechs();
//     } else {
//       setAssignedTechs([]);
//       setTechError(null);
//     }
//   }, [open, data?.id]);

//   const fetchAssignedTechs = async () => {
//     try {
//       setLoadingTechs(true);
//       setTechError(null);
//       const endpoint = ApiEnum.CAMPAIGN_VEHICLE_TECH.path.replace(
//         ":campaignVehicleId",
//         data.id
//       );
//       const response = await request(endpoint);
//       if (response?.success) {
//         setAssignedTechs(response.data || []);
//       } else {
//         setTechError("Unable to load technicians");
//       }
//     } catch (err) {
//       setTechError("Error loading technicians");
//       console.error(err);
//     } finally {
//       setLoadingTechs(false);
//     }
//   };

//   const fetchAvailableTechs = async () => {
//     try {
//       setLoadingAvailableTechs(true);
//       const response = await request(ApiEnum.GET_TECHNICIANS);
//       if (response?.success) setAvailableTechs(response.data || []);
//     } finally {
//       setLoadingAvailableTechs(false);
//     }
//   };

//   const handleStartEdit = (tech) => {
//     const id = tech.userId ?? tech.id ?? "";
//     setEditingTechId(id);
//     setEditingSelectedTechId(String(id));
//     fetchAvailableTechs();
//   };

//   const handleSaveEdit = async () => {
//     if (!editingSelectedTechId) return;

//     const body = {
//       target: "Campaign",
//       targetId: data.id,
//       technicianIds: [editingSelectedTechId],
//     };

//     try {
//       setIsSubmitting(true);
//       const res = await request(ApiEnum.REASSIGN_TECHNICIAN, body);

//       if (res?.success) {
//         await fetchAssignedTechs();
//         setEditingTechId(null);
//         setEditingSelectedTechId("");
//         toast.success("Technician reassigned successfully!");
//       } else {
//         toast.error("Failed to reassign technician.");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error while reassigning technician.");
//     } finally {
//       setIsSubmitting(false);
//       setShowConfirm(false);
//     }
//   };

//   return (
//     <>
//       <Modal
//         isOpen={open}
//         onClose={onClose}
//         title={
//           campaign ? `Vehicle - ${campaign.status}` : "UnderRepair Details"
//         }
//         size="lg"
//         showFooter={false}
//       >
//         <div className="campaign-modal">
//           {/* Customer */}
//           <h3 className="campaign-section-title">Customer</h3>
//           <div className="campaign-info-row">
//             <div className="campaign-info-block">
//               <span className="info-block-label">Customer Name</span>
//               <span className="info-block-value">
//                 {displayValue(customer.name)}
//               </span>
//             </div>
//             <div className="campaign-info-block">
//               <span className="info-block-label">Phone</span>
//               <span className="info-block-value">
//                 {displayValue(customer.phone)}
//               </span>
//             </div>
//           </div>

//           {/* Vehicle */}
//           <h3 className="campaign-section-title">Vehicle Information</h3>
//           <div className="campaign-info-row">
//             <div className="campaign-info-block">
//               <span className="info-block-label">Model</span>
//               <span className="info-block-value">
//                 {displayValue(vehicle.model)}
//               </span>
//             </div>
//             <div className="campaign-info-block">
//               <span className="info-block-label">VIN</span>
//               <span className="info-block-value">
//                 {displayValue(vehicle.vin)}
//               </span>
//             </div>
//             <div className="campaign-info-block">
//               <span className="info-block-label">Year</span>
//               <span className="info-block-value">
//                 {displayValue(vehicle.year)}
//               </span>
//             </div>
//           </div>

//           {/* Campaign */}
//           <h3 className="campaign-section-title">Campaign Details</h3>
//           <div className="campaign-info-row">
//             <div className="campaign-info-block full-width">
//               <span className="info-block-label">Title</span>
//               <span className="info-block-value">
//                 {displayValue(campaign.title)}
//               </span>
//             </div>
//           </div>

//           {/* Assigned Technicians */}
//           <h3 className="campaign-section-title">Assigned Technicians</h3>
//           {loadingTechs ? (
//             <p className="loading-text">Loading assigned technicians...</p>
//           ) : techError ? (
//             <p style={{ color: "red" }}>{techError}</p>
//           ) : assignedTechs.length > 0 ? (
//             <div className="technicians-list">
//               {assignedTechs.map((tech) => (
//                 <div key={tech.userId} className="technician-item">
//                   <div className="technician-meta">
//                     <div className="technician-icon">👤</div>
//                     <div className="technician-name">{tech.name}</div>
//                   </div>

//                   {editingTechId === tech.userId ? (
//                     <div className="edit-controls technician-actions">
//                       <select
//                         value={editingSelectedTechId || ""}
//                         disabled={loadingAvailableTechs}
//                         onChange={(e) =>
//                           setEditingSelectedTechId(e.target.value)
//                         }
//                       >
//                         <option value="">-- Select technician --</option>
//                         {availableTechs.map((t) => {
//                           const tid = t.userId ?? t.id ?? "";
//                           return (
//                             <option key={tid} value={String(tid)}>
//                               {t.name}
//                             </option>
//                           );
//                         })}
//                       </select>

//                       <Button
//                         disabled={!editingSelectedTechId}
//                         onClick={() => setShowConfirm(true)}
//                       >
//                         Save
//                       </Button>

//                       <Button
//                         variant="secondary"
//                         onClick={() => {
//                           setEditingTechId(null);
//                           setEditingSelectedTechId("");
//                         }}
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   ) : (
//                     <Button
//                       variant="text"
//                       onClick={() => handleStartEdit(tech)}
//                     >
//                       Edit
//                     </Button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="no-technicians">No technicians assigned yet.</p>
//           )}

//           <div className="campaign-footer">
//             <Button variant="secondary" onClick={onClose}>
//               Back
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Confirm Dialog */}
//       {showConfirm && (
//         <ConfirmDialog
//           isOpen={showConfirm}
//           title="Confirm Reassignment"
//           message="Are you sure you want to reassign this technician?"
//           onCancel={() => setShowConfirm(false)}
//           onConfirm={handleSaveEdit}
//           confirmText="Yes, Reassign"
//         />
//       )}
//     </>
//   );
// };

// UnderRepair.propTypes = {
//   open: PropTypes.bool,
//   onClose: PropTypes.func,
//   data: PropTypes.object,
// };

// export default UnderRepair;

// chọn nhiều tech
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import "../components/UI.css";

const UnderRepair = ({ open, onClose, data }) => {
  const [assignedTechs, setAssignedTechs] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [techError, setTechError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [selectedTechIds, setSelectedTechIds] = useState([]);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loadingAvailableTechs, setLoadingAvailableTechs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const campaign = data?.raw ?? {};
  const vehicle = campaign.vehicle ?? {};
  const customer = campaign.customer ?? {};

  const displayValue = (value) => (!value && value !== 0 ? "—" : value);

  useEffect(() => {
    if (open && data?.id) fetchAssignedTechs();
    else {
      setAssignedTechs([]);
      setTechError(null);
    }
  }, [open, data?.id]);

  const fetchAssignedTechs = async () => {
    try {
      setLoadingTechs(true);
      setTechError(null);
      const endpoint = ApiEnum.CAMPAIGN_VEHICLE_TECH.path.replace(
        ":campaignVehicleId",
        data.id
      );
      const response = await request(endpoint);
      if (response?.success) setAssignedTechs(response.data || []);
      else setTechError("Unable to load technicians");
    } catch (err) {
      setTechError("Error loading technicians");
      console.error(err);
    } finally {
      setLoadingTechs(false);
    }
  };

  const fetchAvailableTechs = async () => {
    try {
      setLoadingAvailableTechs(true);
      const response = await request(ApiEnum.GET_TECHNICIANS);
      if (response?.success) setAvailableTechs(response.data || []);
    } finally {
      setLoadingAvailableTechs(false);
    }
  };

  const handleStartEdit = async () => {
    setEditing(true);
    setSelectedTechIds(assignedTechs.map((t) => t.userId ?? t.id ?? ""));
    await fetchAvailableTechs();
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setSelectedTechIds([]);
  };

  const handleSaveEdit = async () => {
    if (!selectedTechIds.length) return;

    const body = {
      target: "Campaign",
      targetId: data.id,
      technicianIds: selectedTechIds,
    };

    try {
      setIsSubmitting(true);
      const res = await request(ApiEnum.REASSIGN_TECHNICIAN, body);
      if (res?.success) {
        await fetchAssignedTechs();
        toast.success("Technicians reassigned successfully!");
        handleCancelEdit();
      } else {
        toast.error("Failed to reassign technicians.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while reassigning technicians.");
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={open}
        onClose={onClose}
        title={
          campaign ? `Vehicle - ${campaign.status}` : "UnderRepair Details"
        }
        size="lg"
        showFooter={false}
      >
        <div className="campaign-modal">
          {/* Customer Info */}
          <h3 className="campaign-section-title">Customer</h3>
          <div className="campaign-info-row">
            <div className="campaign-info-block">
              <span className="info-block-label">Customer Name</span>
              <span className="info-block-value">
                {displayValue(customer.name)}
              </span>
            </div>
            <div className="campaign-info-block">
              <span className="info-block-label">Phone</span>
              <span className="info-block-value">
                {displayValue(customer.phone)}
              </span>
            </div>
          </div>

          {/* Vehicle Info */}
          <h3 className="campaign-section-title">Vehicle Information</h3>
          <div className="campaign-info-row">
            <div className="campaign-info-block">
              <span className="info-block-label">Model</span>
              <span className="info-block-value">
                {displayValue(vehicle.model)}
              </span>
            </div>
            <div className="campaign-info-block">
              <span className="info-block-label">VIN</span>
              <span className="info-block-value">
                {displayValue(vehicle.vin)}
              </span>
            </div>
            <div className="campaign-info-block">
              <span className="info-block-label">Year</span>
              <span className="info-block-value">
                {displayValue(vehicle.year)}
              </span>
            </div>
          </div>

          {/* Campaign Info */}
          <h3 className="campaign-section-title">Campaign Details</h3>
          <div className="campaign-info-row">
            <div className="campaign-info-block full-width">
              <span className="info-block-label">Title</span>
              <span className="info-block-value">
                {displayValue(campaign.title)}
              </span>
            </div>
          </div>

          {/* Assigned Technicians */}
          <h3 className="campaign-section-title">Assigned Technicians</h3>
          {loadingTechs ? (
            <p className="loading-text">Loading assigned technicians...</p>
          ) : techError ? (
            <p style={{ color: "red" }}>{techError}</p>
          ) : assignedTechs.length > 0 ? (
            <div className="technicians-list">
              {!editing ? (
                <>
                  {assignedTechs.map((tech) => (
                    <div key={tech.userId} className="technician-item">
                      <div className="technician-meta">
                        <div className="technician-icon">👤</div>
                        <div className="technician-name">{tech.name}</div>
                      </div>
                    </div>
                  ))}
                  <Button variant="primary" onClick={handleStartEdit}>
                    Edit Technicians
                  </Button>
                </>
              ) : (
                <div className="technician-actions edit-controls">
                  <select
                    multiple
                    value={selectedTechIds}
                    disabled={loadingAvailableTechs}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(
                        (opt) => opt.value
                      );
                      setSelectedTechIds(selected);
                    }}
                  >
                    {availableTechs.map((t) => {
                      const tid = t.userId ?? t.id ?? "";
                      return (
                        <option key={tid} value={String(tid)}>
                          {t.name}
                        </option>
                      );
                    })}
                  </select>
                  <Button
                    className="btn-primary"
                    disabled={!selectedTechIds.length || isSubmitting}
                    onClick={() => setShowConfirm(true)}
                  >
                    Save
                  </Button>
                  <Button className="btn-secondary" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="no-technicians">No technicians assigned yet.</p>
          )}

          <div className="campaign-footer">
            <Button variant="secondary" onClick={onClose}>
              Back
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      {showConfirm && (
        <ConfirmDialog
          isOpen={showConfirm}
          title="Confirm Reassignment"
          message="Are you sure you want to reassign these technicians?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleSaveEdit}
          confirmText="Yes, Reassign"
        />
      )}
    </>
  );
};

UnderRepair.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
};

export default UnderRepair;
