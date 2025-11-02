// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { Button } from "../../../../components/atoms/Button/Button";
// import { request, ApiEnum } from "../../../../services/NetworkUntil";
// import "./UI.css";

// const WaitingForRepair = ({ open, onClose, data, onSuccess }) => {
//   const [techs, setTechs] = useState([]);
//   const [selectedTechs, setSelectedTechs] = useState([""]); // array
//   const [assigning, setAssigning] = useState(false);

//   if (!open) return null;

//   const campaign = data?.raw ?? {};
//   const vehicle = campaign.vehicle ?? {};
//   const customer = campaign.customer ?? {};

//   useEffect(() => {
//     let mounted = true;
//     const loadTechs = async () => {
//       try {
//         const res = await request(ApiEnum.GET_TECHNICIANS, {});
//         const list = Array.isArray(res?.data)
//           ? res.data
//           : Array.isArray(res?.items)
//           ? res.items
//           : [];
//         if (mounted) setTechs(list);
//       } catch (err) {
//         console.error("Failed to load technicians", err);
//       }
//     };
//     loadTechs();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const handleAddTech = () => {
//     setSelectedTechs([...selectedTechs, ""]);
//   };

//   const handleChangeTech = (index, value) => {
//     const updated = [...selectedTechs];
//     updated[index] = value;
//     setSelectedTechs(updated);
//   };

//   const handleRemoveTech = (index) => {
//     const updated = selectedTechs.filter((_, i) => i !== index);
//     setSelectedTechs(updated);
//   };

//   const handleAssign = async () => {
//     const id = campaign.campaignVehicleId ?? campaign.id;
//     if (!id) {
//       alert("Missing campaign vehicle id");
//       return;
//     }

//     const validTechs = selectedTechs.filter(Boolean);
//     if (validTechs.length === 0) {
//       alert("Please select at least one technician");
//       return;
//     }

//     setAssigning(true);
//     try {
//       await request(ApiEnum.CAMPAIGNVEHICLE_STAFF_TECH, {
//         params: { id },
//         technicianIds: validTechs,
//       });
//       onSuccess?.();
//       onClose();
//     } catch (err) {
//       console.error("Assign failed", err);
//       alert("Failed to assign technician");
//     } finally {
//       setAssigning(false);
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-card">
//         <button className="modal-close" onClick={onClose}>
//           ×
//         </button>

//         <h2>Campaign</h2>
//         <div style={{ fontSize: 14, color: "#666" }}>
//           {campaign.status ?? "WAITING_FOR_REPAIR"}
//         </div>
//         <p style={{ marginTop: 8, color: "#666" }}>{campaign.note ?? ""}</p>

//         <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
//           <div style={{ flex: 1 }}>
//             <h4>👤 Customer Information</h4>
//             <div>{customer.name ?? "—"}</div>
//             <div>{customer.phone ?? ""}</div>
//           </div>

//           <div style={{ flex: 1 }}>
//             <h4>🚗 Vehicle Information</h4>
//             <div>Model: {vehicle.model ?? "—"}</div>
//             <div>VIN: {vehicle.vin ?? "—"}</div>
//             <div>Year: {vehicle.year ?? "—"}</div>
//           </div>
//         </div>

//         <hr />

//         <div>
//           <h4>🛠 Campaign Information</h4>
//           <div>Title: {campaign.title ?? "—"}</div>
//           <div>Description: {campaign.description ?? "—"}</div>
//           <div>Type: {campaign.type ?? "—"}</div>
//           <div>Period: {(campaign.startDate && campaign.endDate) ?? "—"}</div>
//         </div>

//         <hr />

//         {/* <hr style={{ margin: "12px 0" }} />
//         <div>
//           <h4>Parts to Replace/Repair</h4>
//           <div>{campaign.partReplace ?? "—"}</div>
//         </div>
//         <hr /> */}

//         <div>
//           <h4>Select Technician *</h4>
//           {selectedTechs.map((tech, index) => (
//             <div
//               key={index}
//               style={{
//                 display: "flex",
//                 gap: 8,
//                 alignItems: "center",
//                 marginBottom: 8,
//               }}
//             >
//               <select
//                 value={tech}
//                 onChange={(e) => handleChangeTech(index, e.target.value)}
//                 style={{ flex: 1, padding: 8 }}
//               >
//                 <option value="">Select technician...</option>
//                 {techs.map((t) => (
//                   <option
//                     key={t.id ?? t.employeeId ?? t.userId}
//                     value={t.id ?? t.employeeId ?? t.userId}
//                   >
//                     {t.name ?? t.fullName ?? t.username}
//                   </option>
//                 ))}
//               </select>

//               {selectedTechs.length > 1 && (
//                 <Button
//                   variant="danger"
//                   size="sm"
//                   onClick={() => handleRemoveTech(index)}
//                 >
//                   ✕
//                 </Button>
//               )}
//             </div>
//           ))}

//           <Button variant="secondary" size="sm" onClick={handleAddTech}>
//             + Add more technician
//           </Button>
//         </div>

//         <div className="modal-footer">
//           <Button variant="secondary" onClick={onClose}>
//             Back
//           </Button>
//           <Button variant="primary" onClick={handleAssign} disabled={assigning}>
//             {assigning ? "Assigning..." : "Assignment"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// WaitingForRepair.propTypes = {
//   open: PropTypes.bool,
//   onClose: PropTypes.func,
//   data: PropTypes.object,
//   onSuccess: PropTypes.func,
// };

// export default WaitingForRepair;

import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import "../components/UI.css";

const WaitingForRepair = ({ open, onClose, data, onSuccess }) => {
  const [techs, setTechs] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState([""]);
  const [assigning, setAssigning] = useState(false);

  // === Dùng các hàm helper giống CampaignViewModal ===
  const displayValue = (value) => {
    if (value === 0 || value === null || value === undefined || value === "") {
      return "—";
    }
    return value;
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
  // ===================================================

  const campaign = data?.raw ?? {};
  const vehicle = campaign.vehicle ?? {};
  const customer = campaign.customer ?? {};

  // === Load technicians ===
  useEffect(() => {
    if (open) {
      let mounted = true;
      const loadTechs = async () => {
        try {
          const res = await request(ApiEnum.GET_TECHNICIANS, {});
          const list = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.items)
            ? res.items
            : [];
          if (mounted) setTechs(list);
        } catch (err) {
          console.error("Failed to load technicians", err);
        }
      };
      loadTechs();
      return () => {
        mounted = false;
      };
    }
  }, [open]);

  const handleAddTech = () => {
    setSelectedTechs([...selectedTechs, ""]);
  };

  const handleChangeTech = (index, value) => {
    const updated = [...selectedTechs];
    updated[index] = value;
    setSelectedTechs(updated);
  };

  const handleRemoveTech = (index) => {
    const updated = selectedTechs.filter((_, i) => i !== index);
    setSelectedTechs(updated);
  };

  // === Confirm assign ===
  const handleAssignClick = async () => {
    const id = campaign.campaignVehicleId ?? campaign.id;
    if (!id) {
      toast.warn("Missing campaign vehicle ID");
      return;
    }
    const validTechs = selectedTechs.filter(Boolean);
    if (validTechs.length === 0) {
      toast.warn("Please select at least one technician");
      return;
    }
    setAssigning(true);
    try {
      const res = await request(ApiEnum.CAMPAIGNVEHICLE_STAFF_TECH, {
        params: { id: pending.id },
        technicianIds: pending.techs,
      });

      if (res.success) {
        toast.success("Technician(s) assigned successfully!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Assignment failed.");
      }
    } catch (err) {
      console.error("Assign failed:", err);
      const msg =
        err?.responseData?.message ||
        err?.message ||
        "System or network error during assignment.";
      toast.error(msg);
    } finally {
      setAssigning(false);
      setIsConfirmOpen(false);
      pendingActionRef.current = null;
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Assign Technician"
      size="xl"
      showFooter={false}
    >
      <div className="campaign-modal">
        {/* === Section 1: Thông tin Khách hàng & Xe === */}
        <h3 className="campaign-section-title">
          Customer & Vehicle Information
        </h3>
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
        <div className="campaign-info-row">
          <div className="campaign-info-block">
            <span className="info-block-label">Vehicle Model</span>
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

        <hr />

        <div>
          <h4>Parts to Replace/Repair</h4>
          <div>Title: {campaign.title ?? "—"}</div>
          <div>Description: {campaign.description ?? "—"}</div>
          <div>Type: {campaign.type ?? "—"}</div>
          <div>Period: {(campaign.startDate && campaign.endDate) ?? "—"}</div>
        </div>

        <hr />

        <hr style={{ margin: "12px 0" }} />
        <div>
          <h4>Parts to Replace/Repair</h4>
          <div>{campaign.partReplace ?? "—"}</div>
        </div>
        <hr />

        {/* === Section 3: Chỉ định Kỹ thuật viên === */}
        <h3 className="campaign-section-title">Assign Technician *</h3>
        <div className="form-group">
          {selectedTechs.map((tech, index) => (
            <div key={index} className="tech-select-row">
              <select
                value={tech}
                onChange={(e) => handleChangeTech(index, e.target.value)}
              >
                <option value="">Select technician...</option>
                {techs.map((t) => (
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

        {/* === Footer === */}
        <div className="campaign-footer">
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignClick}
            disabled={assigning}
          >
            {assigning ? "Assigning..." : "Assign Technician"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

WaitingForRepair.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default WaitingForRepair;
