// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import "./PartList.css";

// export default function InTransit({
//   request,
//   onClose,
//   onReport,
//   onCancelShipment,
//   isLoading,
//   reasonOptions = [],
//   loadingReasons = false,
//   reasonError = "",
//   onLoadReasons,
// }) {
//   const [reason, setReason] = useState("");
//   const [notes, setNotes] = useState("");
//   const [otherReasonDetail, setOtherReasonDetail] = useState("");
//   const [showIncident, setShowIncident] = useState(false);

//   const isValid = Boolean(
//     reason && notes.trim() && (reason !== "Other" || otherReasonDetail.trim())
//   );

//   const formatDate = (date) => {
//     if (!date) return "";
//     try {
//       return new Date(date).toISOString().split("T")[0];
//     } catch {
//       return String(date);
//     }
//   };

//   // const handleSubmit = () => {
//   //   if (!isValid || isLoading) return;
//   //   onReport?.({
//   //     orderId: request.orderId,
//   //     reason,
//   //     reasonDetail: reason === "Other" ? otherReasonDetail.trim() : null,
//   //     notes: notes.trim(),
//   //   });
//   // };
//   const handleSubmit = () => {
//     if (!isValid || isLoading) return;

//     onCancelShipment?.({
//       orderId: request.orderId,
//       reason,
//       reasonDetail: reason === "Other" ? otherReasonDetail.trim() : null,
//       note: notes.trim(),
//     });
//   };

//   useEffect(() => {
//     if (showIncident && reasonOptions.length === 0 && !loadingReasons) {
//       onLoadReasons?.();
//     }
//   }, [showIncident, reasonOptions.length, loadingReasons, onLoadReasons]);

//   if (!request) return null;

//   return (
//     <div
//       className="pl-overlay"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className={`pl-container ${request.status?.toLowerCase() || ""}`}>
//         <div className="pl-header">
//           <h3>Parts Request Details</h3>
//           <button className="pl-close-btn" onClick={onClose}>
//             &times;
//           </button>
//         </div>
//         <div className="pl-content">
//           <div className="pl-info-row">
//             <strong>Status:</strong> {request?.status || "-"}
//           </div>
//           <div className="pl-info-row">
//             <strong>Service Center:</strong>{" "}
//             {request?.serviceCenter || request?.serviceCenterName || "-"}
//           </div>
//           <div className="pl-info-row">
//             <strong>Requested Date:</strong>{" "}
//             {formatDate(request?.requestedDate)}
//           </div>
//           <div className="pl-info-row">
//             <strong>Expected Date:</strong>{" "}
//             {formatDate(request?.expectedDate || request?.waitingDate)}
//           </div>

//           <h3>Delivered Parts</h3>
//           <table className="pl-parts-table big">
//             <thead>
//               <tr>
//                 <th>Part Model</th>
//                 <th>Requested Qty</th>
//                 <th>Oem Stock</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(request?.parts || request?.partOrderItems || []).map((p, i) => (
//                 <tr key={i}>
//                   <td>{p.model}</td>
//                   <td>{p.requestedQty ?? p.quantity ?? 0}</td>
//                   <td>{p.oemStock ?? 0}</td>
//                 </tr>
//               ))}
//               {!(request?.parts || request?.partOrderItems)?.length && (
//                 <tr>
//                   <td colSpan={3} style={{ padding: 12, color: "#64748b" }}>
//                     No parts
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           {showIncident && (
//             <>
//               <h3 style={{ marginTop: 8 }}>Cancel shipment Report</h3>
//               <div
//                 className="pl-date-section"
//                 style={{ flexDirection: "column", alignItems: "flex-start" }}
//               >
//                 <label>Reason</label>
//                 <select
//                   value={reason}
//                   onChange={(e) => setReason(e.target.value)}
//                   disabled={isLoading || loadingReasons}
//                   style={{
//                     width: "100%",
//                     padding: "8px 10px",
//                     borderRadius: 6,
//                     border: "1px solid #cbd5e0",
//                     backgroundColor: loadingReasons ? "#f1f5f9" : "#fff",
//                   }}
//                 >
//                   {reason === "" && !loadingReasons && (
//                     <option value="">-- Choose option --</option>
//                   )}
//                   {loadingReasons && (
//                     <option value="" disabled>
//                       ...
//                     </option>
//                   )}
//                   {!loadingReasons &&
//                     (reasonOptions || []).map((r) => (
//                       <option key={r.value} value={r.value}>
//                         {r.label}
//                       </option>
//                     ))}
//                 </select>
//                 {reasonError && (
//                   <div style={{ color: "#c53030", fontSize: 12, marginTop: 4 }}>
//                     {reasonError}
//                   </div>
//                 )}
//               </div>
//               {reason === "Other" && (
//                 <div
//                   className="pl-date-section"
//                   style={{
//                     flexDirection: "column",
//                     alignItems: "flex-start",
//                     marginTop: 8,
//                   }}
//                 >
//                   <label>Other reason detail</label>
//                   <input
//                     type="text"
//                     value={otherReasonDetail}
//                     onChange={(e) => setOtherReasonDetail(e.target.value)}
//                     disabled={isLoading}
//                     placeholder="Please specify"
//                     style={{
//                       width: "100%",
//                       padding: "8px 10px",
//                       borderRadius: 6,
//                       border: "1px solid #cbd5e0",
//                     }}
//                   />
//                 </div>
//               )}
//               <div
//                 className="pl-date-section"
//                 style={{ flexDirection: "column", alignItems: "flex-start" }}
//               >
//                 <label>Notes (optional)</label>
//                 {/* <textarea
//                   value={note}
//                   onChange={(e) => setNote(e.target.value)}
//                   rows={5}
//                   disabled={isLoading}
//                   style={{
//                     width: "100%",
//                     padding: "10px 12px",
//                     borderRadius: 6,
//                     border: "1px solid #cbd5e0",
//                     resize: "vertical",
//                   }}
//                 /> */}
//                 <textarea
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   rows={5}
//                   disabled={isLoading}
//                   style={{
//                     width: "100%",
//                     padding: "10px 12px",
//                     borderRadius: 6,
//                     border: "1px solid #cbd5e0",
//                     resize: "vertical",
//                   }}
//                 />
//               </div>
//             </>
//           )}

//           <div
//             className="pl-actions"
//             style={{ justifyContent: "space-between" }}
//           >
//             <button
//               className="pl-btn-secondary pl-btn-cancel"
//               onClick={onClose}
//               disabled={isLoading}
//             >
//               Cancel
//             </button>
//             {!showIncident && (
//               <button
//                 className="pl-btn-primary"
//                 onClick={() => setShowIncident(true)}
//                 disabled={isLoading}
//                 style={{ backgroundColor: "red", borderColor: "red" }}
//               >
//                 Emergency Report
//               </button>
//             )}
//             {showIncident && (
//               // <button
//               //   className="pl-btn-primary"
//               //   onClick={handleSubmit}
//               //   disabled={!isValid || isLoading || !request?.orderId}
//               // >
//               //   Confirm report & accept loss
//               // </button>
//               <button
//                 className="pl-btn-primary"
//                 onClick={handleSubmit}
//                 disabled={!isValid || isLoading || !request?.orderId}
//               >
//                 Confirm report & accept loss
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// InTransit.propTypes = {
//   request: PropTypes.object,
//   onClose: PropTypes.func.isRequired,
//   onReport: PropTypes.func,
//   onCancelShipment: PropTypes.func,
//   isLoading: PropTypes.bool,
//   reasonOptions: PropTypes.array,
//   loadingReasons: PropTypes.bool,
//   reasonError: PropTypes.string,
//   onLoadReasons: PropTypes.func,
// };

import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import "./PartList.css";
import { toast } from "react-toastify";

export default function InTransit({
  request,
  onClose,
  onCancelShipment,
  isLoading,
  reasonOptions = [],
  loadingReasons = false,
  reasonError = "",
  onLoadReasons,
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [otherReasonDetail, setOtherReasonDetail] = useState("");
  const [showIncident, setShowIncident] = useState(false);

  const isValid =
    Boolean(reason) &&
    notes.trim() &&
    (reason !== "Other" || otherReasonDetail.trim());

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return String(date);
    }
  };

  useEffect(() => {
    if (showIncident && reasonOptions.length === 0 && !loadingReasons) {
      onLoadReasons?.();
    }
  }, [showIncident, reasonOptions.length, loadingReasons, onLoadReasons]);

  if (!request) return null;

  const handleSubmit = () => {
    if (!isValid || isLoading) return;

    onCancelShipment?.({
      orderId: request.orderId,
      reason,
      reasonDetail: reason === "Other" ? otherReasonDetail.trim() : null,
      note: notes.trim(),
    });
  };

  return (
    <div
      className="pl-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`pl-container ${request.status?.toLowerCase() || ""}`}>
        <div className="pl-header">
          <h3>Parts Request Details</h3>
          <button className="pl-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="pl-content">
          <div className="pl-info-row">
            <strong>Status:</strong> {request?.status || "-"}
          </div>
          <div className="pl-info-row">
            <strong>Service Center:</strong>{" "}
            {request?.serviceCenter || request?.serviceCenterName || "-"}
          </div>
          <div className="pl-info-row">
            <strong>Requested Date:</strong>{" "}
            {formatDate(request?.requestedDate)}
          </div>
          <div className="pl-info-row">
            <strong>Expected Date:</strong>{" "}
            {formatDate(request?.expectedDate || request?.waitingDate)}
          </div>

          <h3>Delivered Parts</h3>
          <table className="pl-parts-table big">
            <thead>
              <tr>
                <th>Part Model</th>
                <th>Requested Qty</th>
                <th>Oem Stock</th>
              </tr>
            </thead>
            <tbody>
              {(request?.parts || request?.partOrderItems || []).map((p, i) => (
                <tr key={i}>
                  <td>{p.model}</td>
                  <td>{p.requestedQty ?? p.quantity ?? 0}</td>
                  <td>{p.oemStock ?? 0}</td>
                </tr>
              ))}
              {!(request?.parts || request?.partOrderItems)?.length && (
                <tr>
                  <td colSpan={3} style={{ padding: 12, color: "#64748b" }}>
                    No parts
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {showIncident && (
            <>
              <h3 style={{ marginTop: 8 }}>Cancel Shipment Report</h3>
              <div
                className="pl-date-section"
                style={{ flexDirection: "column", alignItems: "flex-start" }}
              >
                <label>Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isLoading || loadingReasons}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e0",
                    backgroundColor: loadingReasons ? "#f1f5f9" : "#fff",
                  }}
                >
                  {reason === "" && !loadingReasons && (
                    <option value="">-- Choose option --</option>
                  )}
                  {loadingReasons && (
                    <option value="" disabled>
                      ...
                    </option>
                  )}
                  {!loadingReasons &&
                    (reasonOptions || []).map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                </select>
                {reasonError && (
                  <div style={{ color: "#c53030", fontSize: 12, marginTop: 4 }}>
                    {reasonError}
                  </div>
                )}
              </div>

              {reason === "Other" && (
                <div
                  className="pl-date-section"
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    marginTop: 8,
                  }}
                >
                  <label>Other reason detail</label>
                  <input
                    type="text"
                    value={otherReasonDetail}
                    onChange={(e) => setOtherReasonDetail(e.target.value)}
                    disabled={isLoading}
                    placeholder="Please specify"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e0",
                    }}
                  />
                </div>
              )}

              <div
                className="pl-date-section"
                style={{ flexDirection: "column", alignItems: "flex-start" }}
              >
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e0",
                    resize: "vertical",
                  }}
                />
              </div>
            </>
          )}

          <div
            className="pl-actions"
            style={{ justifyContent: "space-between" }}
          >
            <button
              className="pl-btn-secondary pl-btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            {!showIncident && (
              <button
                className="pl-btn-primary"
                onClick={() => setShowIncident(true)}
                disabled={isLoading}
                style={{ backgroundColor: "red", borderColor: "red" }}
              >
                Emergency Report
              </button>
            )}
            {showIncident && (
              <button
                className="pl-btn-primary"
                onClick={handleSubmit}
                disabled={!isValid || isLoading || !request?.orderId}
              >
                Confirm report & accept loss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

InTransit.propTypes = {
  request: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onCancelShipment: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  reasonOptions: PropTypes.array,
  loadingReasons: PropTypes.bool,
  reasonError: PropTypes.string,
  onLoadReasons: PropTypes.func,
};
