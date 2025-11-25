// import React from "react";
// import PropTypes from "prop-types";
// import "./PartList.css";

// export default function Discrepancy({ request, onClose, onReport }) {
//   const issues = request?.issues || [];
//   const decision = request?.finalDecision || {};

//   // Local state để nhập tay Final Decision
//   const [decisionState, setDecisionState] = React.useState({
//     ecuDecision: decision.ecuDecision || "",
//     engDecision: decision.engDecision || "",
//     notes: decision.notes || "",
//   });

//   if (!request) return null;

//   const handleSubmit = () => {
//     onReport?.({
//       orderId: request.orderId,
//       reason: "DISCREPANCY",
//       ecuDecision: decisionState.ecuDecision,
//       engDecision: decisionState.engDecision,
//       notes: decisionState.notes,
//     });
//   };

//   return (
//     <div
//       className="pl-overlay"
//       onClick={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div
//         className={`pl-container discrepancy ${
//           request.status?.toLowerCase() || ""
//         }`}
//       >
//         <div className="pl-header">
//           <h3>Discrepancy Resolution Details</h3>
//           <button
//             type="button"
//             className="pl-close-btn"
//             aria-label="Close"
//             onClick={onClose}
//           >
//             &times;
//           </button>
//         </div>

//         <div className="pl-content">
//           {/* ===== Basic Info ===== */}
//           <div className="pl-info-row">
//             <strong>Ticket #:</strong> {request?.orderId || "RTN"}
//           </div>
//           <div className="pl-info-row">
//             <strong>Sender:</strong> {request?.serviceCenterName || "SC"}
//           </div>
//           <div className="pl-info-row">
//             <strong>Receiver:</strong> OEM Warehouse A
//           </div>
//           <div className="pl-info-row">
//             <strong>Received Date:</strong>{" "}
//             {request?.receivedDate || request?.expectedDate || "-"}
//           </div>

//           {/* ===== Issues Summary ===== */}
//           <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 8 }}>
//             Issues Summary
//           </h3>

//           <div
//             style={{
//               border: "1px solid #e2e8f0",
//               borderRadius: 8,
//               padding: 12,
//               background: "#f8fafc",
//               fontSize: "1.1rem",
//               lineHeight: 1.5,
//             }}
//           >
//             {issues.length === 0 && (
//               <div style={{ color: "#64748b" }}>No data available.</div>
//             )}

//             {issues.map((it, idx) => (
//               <div key={idx} style={{ marginBottom: 10 }}>
//                 <div style={{ fontWeight: 600, color: "#334155" }}>
//                   {idx + 1}. [{it.type}] {it.quantity} x {it.model} (SN:{" "}
//                   {it.serial})
//                 </div>
//                 <div
//                   style={{
//                     paddingLeft: 12,
//                     fontSize: "1.05rem",
//                     color: "#475569",
//                   }}
//                 >
//                   OEM Note: {it.note || "(No notes)"}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* ===== Final Decision Input ===== */}
//           <h3 className="pl-section-title">Final Decision</h3>

//           <div className="pl-decision-box">
//             <div className="pl-field">
//               <label className="pl-label">Missing Items</label>
//               <input
//                 type="text"
//                 value={decisionState.ecuDecision}
//                 onChange={(e) =>
//                   setDecisionState({
//                     ...decisionState,
//                     ecuDecision: e.target.value,
//                   })
//                 }
//                 placeholder="Enter missing items decision"
//                 className="pl-input"
//               />
//             </div>

//             <div className="pl-field">
//               <label className="pl-label">Damaged Items</label>
//               <input
//                 type="text"
//                 value={decisionState.engDecision}
//                 onChange={(e) =>
//                   setDecisionState({
//                     ...decisionState,
//                     engDecision: e.target.value,
//                   })
//                 }
//                 placeholder="Enter damaged items decision"
//                 className="pl-input"
//               />
//             </div>

//             <div className="pl-field">
//               <label className="pl-label">Decision Notes</label>
//               <textarea
//                 value={decisionState.notes}
//                 onChange={(e) =>
//                   setDecisionState({
//                     ...decisionState,
//                     notes: e.target.value,
//                   })
//                 }
//                 placeholder="Additional notes…"
//                 className="pl-textarea"
//                 rows={3}
//               ></textarea>
//             </div>
//           </div>

//           {/* ===== Actions ===== */}
//           <div className="pl-actions" style={{ display: "flex", gap: 10 }}>
//             <button
//               className="pl-btn-secondary"
//               style={{ marginRight: "auto" }}
//               onClick={onClose}
//             >
//               Close
//             </button>

//             <button className="pl-btn-secondary" onClick={handleSubmit}>
//               Submit Report and Choose Action
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// Discrepancy.propTypes = {
//   request: PropTypes.object,
//   onClose: PropTypes.func.isRequired,
//   onReport: PropTypes.func,
// };

// import React from "react";
// import PropTypes from "prop-types";
// import "./PartList.css";

// export default function Discrepancy({ request, onClose, onReport }) {
//   if (!request) return null;

//   // Tạo issues từ partOrderItems
//   const issues = (request.partOrderItems || []).flatMap((item) => {
//     const arr = [];
//     const missing =
//       item.requestedQuantity - item.receivedQuantity - item.damagedQuantity;
//     if (missing > 0) {
//       arr.push({
//         type: "Missing",
//         quantity: missing,
//         model: item.model,
//         serial: "-",
//         note: item.remarks || "",
//       });
//     }
//     if (item.damagedQuantity > 0) {
//       arr.push({
//         type: "Damaged",
//         quantity: item.damagedQuantity,
//         model: item.model,
//         serial: "-",
//         note: item.remarks || "",
//       });
//     }
//     return arr;
//   });

//   // Prefill final decision nếu có
//   const decision = request.discrepancyResolution || {};
//   const [decisionState, setDecisionState] = React.useState({
//     ecuDecision: decision.ecuDecision || "",
//     engDecision: decision.engDecision || "",
//     notes: decision.notes || "",
//   });

//   // const handleSubmit = () => {
//   //   const partResolutions = issues.map((it) => ({
//   //     model: it.model,
//   //     type: it.type,
//   //     quantity: it.quantity,
//   //     decision:
//   //       it.type === "Missing"
//   //         ? decisionState.ecuDecision
//   //         : decisionState.engDecision,
//   //   }));

//   //   onReport?.({
//   //     orderId: request.orderId,
//   //     partResolutions,
//   //     overallNote: decisionState.notes,
//   //   });
//   // };

//   const handleSubmit = () => {
//     const partResolutions = issues.map((it) => ({
//       serialNumber: it.serial || "-", // add serial
//       model: it.model,
//       discrepancyType: it.type, // "Missing" hoặc "Damaged"
//       responsibleParty: it.type === "Missing" ? "EVM" : "Transport", // ví dụ, bạn có thể map logic khác
//       action:
//         it.type === "Missing"
//           ? decisionState.ecuDecision
//           : decisionState.engDecision, // map action từ input
//       note: it.note || "",
//     }));

//     onReport?.({
//       orderId: request.orderId,
//       partResolutions,
//       overallNote: decisionState.notes,
//     });
//   };

//   return (
//     <div
//       className="pl-overlay"
//       onClick={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div
//         className={`pl-container discrepancy ${
//           request.status?.toLowerCase() || ""
//         }`}
//       >
//         <div className="pl-header">
//           <h3>Discrepancy Resolution Details</h3>
//           <button type="button" className="pl-close-btn" onClick={onClose}>
//             &times;
//           </button>
//         </div>

//         <div className="pl-content">
//           {/* ===== Basic Info ===== */}
//           <div className="pl-info-row">
//             <strong>Ticket #:</strong> {request.orderId || "RTN"}
//           </div>
//           <div className="pl-info-row">
//             <strong>Service Center:</strong> {request.serviceCenterName || "SC"}
//           </div>
//           <div className="pl-info-row">
//             <strong>Receiver:</strong> OEM Warehouse A
//           </div>
//           <div className="pl-info-row">
//             <strong>Received Date:</strong>{" "}
//             {request.partDelivery || request.expectedDate || "-"}
//           </div>

//           {/* ===== Issues Summary ===== */}
//           <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 8 }}>
//             Issues Summary
//           </h3>

//           <div
//             style={{
//               border: "1px solid #e2e8f0",
//               borderRadius: 8,
//               padding: 12,
//               background: "#f8fafc",
//               fontSize: "1.1rem",
//               lineHeight: 1.5,
//             }}
//           >
//             {issues.length === 0 && (
//               <div style={{ color: "#64748b" }}>No discrepancy found.</div>
//             )}

//             {issues.map((it, idx) => (
//               <div key={idx} style={{ marginBottom: 10 }}>
//                 <div style={{ fontWeight: 600, color: "#334155" }}>
//                   {idx + 1}. [{it.type}] {it.quantity} x {it.model} (SN:{" "}
//                   {it.serial})
//                 </div>
//                 <div
//                   style={{
//                     paddingLeft: 12,
//                     fontSize: "1.05rem",
//                     color: "#475569",
//                   }}
//                 >
//                   OEM Note: {it.note || "(No notes)"}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* ===== Final Decision Input ===== */}
//           <h3 className="pl-section-title">Final Decision</h3>

//           <div className="pl-decision-box">
//             <div className="pl-field">
//               <label className="pl-label">Missing Items</label>
//               <input
//                 type="text"
//                 value={decisionState.ecuDecision}
//                 onChange={(e) =>
//                   setDecisionState({
//                     ...decisionState,
//                     ecuDecision: e.target.value,
//                   })
//                 }
//                 placeholder="Enter missing items decision"
//                 className="pl-input"
//               />
//             </div>

//             <div className="pl-field">
//               <label className="pl-label">Damaged Items</label>
//               <input
//                 type="text"
//                 value={decisionState.engDecision}
//                 onChange={(e) =>
//                   setDecisionState({
//                     ...decisionState,
//                     engDecision: e.target.value,
//                   })
//                 }
//                 placeholder="Enter damaged items decision"
//                 className="pl-input"
//               />
//             </div>

//             <div className="pl-field">
//               <label className="pl-label">Decision Notes</label>
//               <textarea
//                 value={decisionState.notes}
//                 onChange={(e) =>
//                   setDecisionState({ ...decisionState, notes: e.target.value })
//                 }
//                 placeholder="Additional notes…"
//                 className="pl-textarea"
//                 rows={3}
//               ></textarea>
//             </div>
//           </div>

//           {/* ===== Actions ===== */}
//           <div className="pl-actions" style={{ display: "flex", gap: 10 }}>
//             <button
//               className="pl-btn-secondary"
//               style={{ marginRight: "auto" }}
//               onClick={onClose}
//             >
//               Close
//             </button>

//             <button className="pl-btn-secondary" onClick={handleSubmit}>
//               Submit Report and Choose Action
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// Discrepancy.propTypes = {
//   request: PropTypes.object,
//   onClose: PropTypes.func.isRequired,
//   onReport: PropTypes.func,
// };

import React from "react";
import PropTypes from "prop-types";
import "./PartList.css";

export default function Discrepancy({
  request,
  onClose,
  onReport,
  resolutionOptions,
  loadingOptions,
  optionError,
}) {
  if (!request) return null;

  /** --------------------------------------------------------
   * Build issues list from order items
   * -------------------------------------------------------- */
  const issues = (request.partOrderItems || []).flatMap((item) => {
    const arr = [];

    const missing =
      item.requestedQuantity - item.receivedQuantity - item.damagedQuantity;

    if (missing > 0) {
      arr.push({
        type: "Shortage",
        quantity: missing,
        model: item.model,
        serial: item.serial || "-",
        note: item.remarks || "",
      });
    }

    if (item.damagedQuantity > 0) {
      arr.push({
        type: "Damaged",
        quantity: item.damagedQuantity,
        model: item.model,
        serial: item.serial || "-",
        note: item.remarks || "",
      });
    }

    return arr;
  });

  /** --------------------------------------------------------
   * STATE: store decision per issue row
   * -------------------------------------------------------- */
  const [decisions, setDecisions] = React.useState(
    issues.map(() => ({
      responsibleParty: "",
      action: "",
      note: "",
    }))
  );

  const [overallNote, setOverallNote] = React.useState("");

  const updateDecision = (idx, field, value) => {
    const newArr = [...decisions];
    newArr[idx][field] = value;
    setDecisions(newArr);
  };

  /** --------------------------------------------------------
   * Handle Submit
   * -------------------------------------------------------- */
  const handleSubmit = () => {
    const partResolutions = issues.map((it, idx) => ({
      serialNumber: it.serial,
      model: it.model,
      discrepancyType: it.type, // "Damaged" | "Shortage" | "Excess"
      responsibleParty: decisions[idx].responsibleParty,
      action: decisions[idx].action,
      note: decisions[idx].note || it.note || "",
    }));

    onReport?.({
      orderId: request.orderId,
      partResolutions,
      overallNote,
    });
  };

  /** --------------------------------------------------------
   * Dropdown data mapping
   * -------------------------------------------------------- */
  const {
    discrepancyTypes = [],
    responsibleParties = [],
    damagedPartActions = [],
    excessPartActions = [],
    shortagePartActions = [],
  } = resolutionOptions || {};

  const getActionOptions = (type) => {
    if (type === "Damaged") return damagedPartActions;
    if (type === "Excess") return excessPartActions;
    return shortagePartActions; // Shortage
  };

  return (
    <div
      className="pl-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pl-container discrepancy">
        <div className="pl-header">
          <h3>Discrepancy Resolution</h3>
          <button className="pl-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="pl-content">
          {/* ----------------------- */}
          {/*       BASIC INFO        */}
          {/* ----------------------- */}
          <div className="pl-info-row">
            <strong>Ticket #:</strong> {request.orderId}
          </div>
          <div className="pl-info-row">
            <strong>Service Center:</strong> {request.serviceCenterName}
          </div>

          {/* ----------------------- */}
          {/*       ISSUES TABLE      */}
          {/* ----------------------- */}
          <h3 className="pl-section-title">Issues Summary</h3>

          {loadingOptions && <div>Loading options…</div>}
          {optionError && <div style={{ color: "red" }}>{optionError}</div>}

          {issues.map((it, idx) => {
            const actions = getActionOptions(it.type);

            return (
              <div
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  background: "#fafafa",
                }}
              >
                <strong>
                  {idx + 1}. [{it.type}] {it.quantity} × {it.model} (SN:{" "}
                  {it.serial})
                </strong>

                {/* responsible party */}
                <div className="pl-field">
                  <label className="pl-label">Responsible Party</label>
                  <select
                    className="pl-input"
                    value={decisions[idx].responsibleParty}
                    onChange={(e) =>
                      updateDecision(idx, "responsibleParty", e.target.value)
                    }
                  >
                    <option value="">Select…</option>
                    {responsibleParties.map((rp) => (
                      <option key={rp.value} value={rp.value}>
                        {rp.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* action to perform */}
                <div className="pl-field">
                  <label className="pl-label">Action</label>
                  <select
                    className="pl-input"
                    value={decisions[idx].action}
                    onChange={(e) =>
                      updateDecision(idx, "action", e.target.value)
                    }
                  >
                    <option value="">Select Action…</option>
                    {actions.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* note */}
                <div className="pl-field">
                  <label className="pl-label">Note</label>
                  <textarea
                    className="pl-textarea"
                    value={decisions[idx].note}
                    onChange={(e) =>
                      updateDecision(idx, "note", e.target.value)
                    }
                  />
                </div>
              </div>
            );
          })}

          {/* ------------------------ */}
          {/*      Overall Note        */}
          {/* ------------------------ */}
          <h3 className="pl-section-title">Overall Notes</h3>
          <textarea
            className="pl-textarea"
            rows={3}
            value={overallNote}
            onChange={(e) => setOverallNote(e.target.value)}
          />

          {/* ------------------------ */}
          {/*         Actions          */}
          {/* ------------------------ */}
          <div className="pl-actions" style={{ display: "flex", gap: 12 }}>
            <button className="pl-btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="pl-btn-primary" onClick={handleSubmit}>
              Submit Resolution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Discrepancy.propTypes = {
  request: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onReport: PropTypes.func,
  resolutionOptions: PropTypes.object,
  loadingOptions: PropTypes.bool,
  optionError: PropTypes.string,
};
