// import React, { useState, useRef } from "react";
// import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
// import { toast } from "react-toastify";
// import "./PartsListEVM.css";

// const formatDateTime = (dateStr) => {
//   if (!dateStr) return "";
//   const d = new Date(dateStr);
//   return d.toLocaleString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//     hour: "numeric",
//     minute: "numeric",
//     hour12: true,
//   });
// };

// const Timeline = ({ request }) => {
//   if (!request) return null;
//   const steps = [
//     { label: "Request Created", date: request.requestDate, active: true },
//     {
//       label: "Confirmed by EVM",
//       date: request.approvedDate,
//       active: !!request.approvedDate,
//     },
//     {
//       label: "Parts Shipped",
//       date: request.shippedDate,
//       active: !!request.shippedDate,
//     },
//   ];

//   return (
//     <div
//       className="timeline-inline"
//       style={{ marginTop: "0", paddingTop: "0", borderTop: "none" }}
//     >
//       <h4 style={{ marginBottom: "15px", color: "#4a5568" }}>
//         Request Timeline
//       </h4>
//       <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
//         {steps.map((step, idx) => (
//           <div
//             key={idx}
//             className={`timeline-item ${step.active ? "active" : ""}`}
//           >
//             <div className="timeline-icon"></div>
//             <div className="timeline-content">
//               <h4>{step.label}</h4>
//               {step.date ? (
//                 <p>{formatDateTime(step.date)}</p>
//               ) : (
//                 <p style={{ fontStyle: "italic", fontSize: "0.8rem" }}>
//                   Pending...
//                 </p>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default function Confirmed({
//   request,
//   onClose,
//   onValidate,
//   onDelivered,
//   isLoading,
// }) {
//   const [isConfirmOpen, setIsConfirmOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [validationResult, setValidationResult] = useState(null);
//   const [isValidating, setIsValidating] = useState(false);
//   const fileInputRef = useRef(null);

//   if (!request) return null;

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       setValidationResult(null); // Reset kết quả cũ khi chọn file mới
//     }
//   };

//   // --- LOGIC GỘP: VALIDATE TRƯỚC RỒI MỚI SHIP ---
//   const handleValidateAndShip = async () => {
//     if (!selectedFile) {
//       toast.warning("Please select an Excel file first.");
//       return;
//     }

//     // 1. Bắt đầu Validate
//     setIsValidating(true);
//     const res = await onValidate(request.orderId, selectedFile);
//     setIsValidating(false);

//     // 2. Xử lý kết quả Validate
//     if (res.success) {
//       setValidationResult(res.data);

//       if (res.data.isValid) {
//         // Validate thành công -> Mở Confirm Dialog ngay lập tức
//         setIsConfirmOpen(true);
//       } else {
//         // Validate thất bại -> Hiện lỗi đỏ
//         toast.error("Validation failed. Please check errors below.");
//       }
//     } else {
//       // Lỗi API
//       if (res.data || res.errors || res.quantityDiscrepancies) {
//         setValidationResult(res.data || res);
//       }
//       toast.error(res.message || "Validation error.");
//     }
//   };

//   const handleConfirmDialog = () => {
//     setIsConfirmOpen(false);
//     onDelivered(request.orderId); // Gọi API Ship thật
//   };

//   // --- HELPER: Lấy dữ liệu Discrepancy cho từng Model ---
//   const getDiscrepancyInfo = (modelName) => {
//     if (!validationResult || !validationResult.quantityDiscrepancies)
//       return null;
//     const disc = Object.values(validationResult.quantityDiscrepancies).find(
//       (d) => d.model === modelName
//     );
//     return disc;
//   };

//   return (
//     <div className="popup-overlay">
//       <div className="popup-card">
//         <div className="popup-header">
//           <h3>Parts Request Details - {request.status}</h3>
//         </div>

//         <div className="popup-body">
//           {/* 1. Thông tin chung */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "20px",
//               marginBottom: "10px",
//             }}
//           >
//             <div>
//               <div
//                 className="info-row"
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                 }}
//               >

//               </div>
//               <div className="info-row">
//                 <strong>Service Center:</strong> {request.serviceCenter}
//               </div>
//               <div className="info-row">
//                 <strong>Requested By:</strong> {request.requestedBy}
//               </div>
//               <div className="info-row">
//                 <strong>Requested Date:</strong>{" "}
//                 {formatDateTime(request.requestDate)}
//               </div>
//             </div>
//             <div>
//               {request.notes && (
//                 <div
//                   style={{
//                     background: "#edf2f7",
//                     padding: "10px",
//                     borderRadius: "6px",
//                   }}
//                 >
//                   <strong>Note:</strong>{" "}
//                   <span style={{ fontSize: "0.9rem" }}>{request.notes}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* 2. Bảng hàng hóa */}
//           <h4 style={{ marginTop: "10px", marginBottom: "5px" }}>
//             Requested Parts
//           </h4>
//           <table className="parts-detail">
//             <thead>
//               <tr>
//                 <th>Part Model</th>
//                 <th style={{ textAlign: "center" }}>Req Qty</th>
//                 <th style={{ textAlign: "center" }}>OEM Stock</th>

//                 {/* Chỉ hiện cột này khi đã Validate và có lỗi số lượng */}
//                 {validationResult && !validationResult.isValid && (
//                   <>
//                     <th
//                       style={{
//                         textAlign: "center",
//                         background: "#fff5f5",
//                         color: "#c53030",
//                       }}
//                     >
//                       Provided
//                     </th>
//                     <th
//                       style={{
//                         textAlign: "center",
//                         background: "#fff5f5",
//                         color: "#c53030",
//                       }}
//                     >
//                       Diff
//                     </th>
//                   </>
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {request.parts?.map((p, i) => {
//                 const disc = getDiscrepancyInfo(p.model);
//                 return (
//                   <tr key={i}>
//                     <td>{p.model}</td>
//                     <td style={{ textAlign: "center" }}>{p.requestedQty}</td>
//                     <td style={{ textAlign: "center" }}>{p.oemStock}</td>

//                     {validationResult && !validationResult.isValid && (
//                       <>
//                         <td
//                           style={{
//                             textAlign: "center",
//                             background: "#fff5f5",
//                             fontWeight: "bold",
//                           }}
//                         >
//                           {disc ? disc.provided : "-"}
//                         </td>
//                         <td
//                           style={{ textAlign: "center", background: "#fff5f5" }}
//                         >
//                           {disc ? (
//                             <span
//                               style={{
//                                 color: disc.difference < 0 ? "red" : "blue",
//                                 fontWeight: "bold",
//                               }}
//                             >
//                               {disc.difference > 0
//                                 ? `+${disc.difference}`
//                                 : disc.difference}
//                             </span>
//                           ) : (
//                             <span style={{ color: "green" }}>OK</span>
//                           )}
//                         </td>
//                       </>
//                     )}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           <div
//             className="info-row"
//             style={{ marginTop: "15px", fontSize: "1rem" }}
//           >
//             <strong>Expected Delivery Date:</strong>{" "}
//             <span style={{ color: "#2b6cb0" }}>
//               {request.expectedDate || "Not set"}
//             </span>
//           </div>

//           {/* 3. Timeline */}
//           <div
//             style={{
//               marginTop: "20px",
//               padding: "15px",
//               border: "1px solid #e2e8f0",
//               borderRadius: "8px",
//               background: "#fafbfc",
//             }}
//           >
//             <Timeline request={request} />
//           </div>

//           {/* 4. VALIDATION SECTION */}
//           <div className="validation-section">
//             <h4 style={{ margin: "0 0 12px 0", color: "#2d3748" }}>
//               Process Shipment
//             </h4>

//             <div className="import-excel-wrapper">
//               {/* Box Upload có thể click */}
//               <div
//                 className="upload-dashed-box"
//                 onClick={() => fileInputRef.current.click()}
//               >
//                 <input
//                   type="file"
//                   accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
//                   ref={fileInputRef}
//                   onChange={handleFileChange}
//                   style={{ display: "none" }}
//                 />
//                 <div className="upload-icon">☁️</div>

//                 <div>
//                   {selectedFile ? (
//                     <div style={{ fontWeight: 600, color: "#0f172a" }}>
//                       📄 {selectedFile.name}
//                     </div>
//                   ) : (
//                     <span style={{ color: "#64748b" }}>No file selected</span>
//                   )}
//                 </div>

//                 <div className="upload-btn-label">
//                   {selectedFile
//                     ? "📂 Change File"
//                     : "📤 Upload Excel to Validate"}
//                 </div>
//                 <div className="upload-hint">
//                   *Upload Excel file to validate serials before shipping
//                 </div>
//               </div>

//               {/* Đã xóa nút Validate ở giữa - chỉ còn nút Ship ở Footer */}
//             </div>

//             {/* KẾT QUẢ VALIDATE (Chỉ hiện khi có kết quả) */}
//             {validationResult && (
//               <div className="validation-result" style={{ marginTop: "12px" }}>
//                 {validationResult.isValid ? (
//                   <div className="validation-success">
//                     ✅ <strong>Validation Passed!</strong> Ready to ship.
//                   </div>
//                 ) : (
//                   <div className="validation-error">
//                     <strong style={{ display: "block", marginBottom: "5px" }}>
//                       ⚠️ Validation Failed:
//                     </strong>

//                     {/* 1. Lỗi chung */}
//                     {validationResult.errors?.length > 0 && (
//                       <ul className="error-list">
//                         {validationResult.errors.map((err, idx) => (
//                           <li key={idx}>{err}</li>
//                         ))}
//                       </ul>
//                     )}

//                     {/* 2. Lỗi Serial */}
//                     {validationResult.serialErrors &&
//                       validationResult.serialErrors.length > 0 && (
//                         <div style={{ marginTop: "10px" }}>
//                           <strong
//                             style={{ color: "#c53030", fontSize: "0.9rem" }}
//                           >
//                             Serial Number Errors:
//                           </strong>
//                           <div
//                             style={{
//                               marginTop: "5px",
//                               maxHeight: "150px",
//                               overflowY: "auto",
//                               border: "1px solid #fed7d7",
//                               borderRadius: "6px",
//                             }}
//                           >
//                             <table
//                               className="parts-detail"
//                               style={{ margin: 0, background: "white" }}
//                             >
//                               <thead style={{ position: "sticky", top: 0 }}>
//                                 <tr>
//                                   <th>Model</th>
//                                   <th>Serial</th>
//                                   <th>Message</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {validationResult.serialErrors.map(
//                                   (err, idx) => (
//                                     <tr key={idx}>
//                                       <td style={{ fontWeight: 500 }}>
//                                         {err.model}
//                                       </td>
//                                       <td style={{ fontFamily: "monospace" }}>
//                                         {err.serialNumber}
//                                       </td>
//                                       <td style={{ color: "#e53e3e" }}>
//                                         {err.message}
//                                       </td>
//                                     </tr>
//                                   )
//                                 )}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* 5. Footer Actions */}
//           <div className="popup-actions">
//             <button
//               className="btn-secondary btn-cancel"
//               onClick={onClose}
//               disabled={isLoading}
//             >
//               Close
//             </button>

//             {/* Nút duy nhất: Ship Parts
//                 - Nếu chưa chọn file -> Disabled
//                 - Nếu đang validating -> Hiện Loading
//                 - Nếu đã validate thành công -> Vẫn là nút này để gọi ConfirmDialog
//             */}
//             <button
//               className="btn-confirm"
//               onClick={handleValidateAndShip}
//               disabled={isLoading || isValidating || !selectedFile}
//               style={{
//                 opacity: isLoading || isValidating || !selectedFile ? 0.6 : 1,
//                 cursor:
//                   isLoading || isValidating || !selectedFile
//                     ? "not-allowed"
//                     : "pointer",
//                 minWidth: "160px",
//               }}
//             >
//               {isValidating ? "Validating..." : "Ship Parts 🚚"}
//             </button>
//           </div>
//         </div>
//       </div>

//       <ConfirmDialog
//         isOpen={isConfirmOpen}
//         title="Confirm Shipment"
//         message="All serial numbers are valid. Are you sure you want to confirm shipment?"
//         confirmLabel="Yes, Ship It"
//         cancelLabel="Cancel"
//         onConfirm={handleConfirmDialog}
//         onCancel={() => setIsConfirmOpen(false)}
//         isLoading={isLoading}
//       />
//     </div>
//   );
// }

import React, { useState, useRef } from "react";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";
import "./PartsListEVM.css";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

const Timeline = ({ request }) => {
  if (!request) return null;
  const steps = [
    { label: "Request Created", date: request.requestDate, active: true },
    {
      label: "Confirmed by EVM",
      date: request.approvedDate,
      active: !!request.approvedDate,
    },
    {
      label: "Parts Shipped",
      date: request.shippedDate,
      active: !!request.shippedDate,
    },
  ];

  return (
    <div
      className="timeline-inline"
      style={{ marginTop: "0", paddingTop: "0", borderTop: "none" }}
    >
      <h4 style={{ marginBottom: "15px", color: "#4a5568" }}>
        Request Timeline
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`timeline-item ${step.active ? "active" : ""}`}
          >
            <div className="timeline-icon"></div>
            <div className="timeline-content">
              <h4>{step.label}</h4>
              {step.date ? (
                <p>{formatDateTime(step.date)}</p>
              ) : (
                <p style={{ fontStyle: "italic", fontSize: "0.8rem" }}>
                  Pending...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Confirmed({
  request,
  onClose,
  onValidate,
  onDelivered,
  isLoading,
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef(null);

  if (!request) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null); // Reset kết quả khi chọn file mới
    }
  };

  const onInputClick = (e) => {
    e.target.value = null;
  };

  // --- BUTTON 1: CHỈ VALIDATE ---
  const handleValidateOnly = async () => {
    if (!selectedFile) {
      toast.warning("Please select an Excel file first.");
      return;
    }

    setIsValidating(true);
    const res = await onValidate(request.orderId, selectedFile);
    setIsValidating(false);

    // Xử lý kết quả trả về (cả success và error có data)
    if (res.success) {
      setValidationResult(res.data);
      if (res.data.isValid) {
        toast.success("Validation Passed! You can now ship parts.");
      } else {
        toast.error("Validation failed. Check details below.");
      }
    } else {
      // Trường hợp API trả về lỗi 400/500 nhưng có body data chi tiết
      if (res.data) {
        setValidationResult(res.data);
      }
      toast.error(res.message || "Validation error.");
    }
  };

  // --- BUTTON 2: SHIP PARTS ---
  const handleShipClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDialog = () => {
    setIsConfirmOpen(false);
    onDelivered(request.orderId);
  };

  const getDiscrepancyInfo = (modelName) => {
    if (!validationResult || !validationResult.quantityDiscrepancies)
      return null;

    const discrepancies = validationResult.quantityDiscrepancies;
    // Tìm theo key hoặc value để đảm bảo khớp model
    return (
      discrepancies[modelName] ||
      Object.values(discrepancies).find((d) => d.model === modelName)
    );
  };

  // Helper tính toán số lượng hiển thị trong bảng (Trừ đi các serial lỗi)
  const getRowStatus = (modelName, requestedQty) => {
    if (!validationResult) return null;

    const { quantityDiscrepancies = {}, serialErrors = [] } = validationResult;

    // 1. Tổng số lượng tìm thấy trong file Excel (bao gồm cả lỗi serial)
    let discrepancy =
      quantityDiscrepancies[modelName] ||
      Object.values(quantityDiscrepancies).find((d) => d.model === modelName);

    // Mặc định: nếu validate OK hoặc không có discrepancy, giả sử provided = requested.
    // Nếu có discrepancy, lấy số lượng thực tế từ file.
    let totalProvidedInExcel = discrepancy
      ? discrepancy.provided
      : validationResult.isValid
      ? requestedQty
      : 0;

    // 2. Đếm số lượng Serial bị lỗi (Not In Stock, Wrong Model...)
    const invalidCount = serialErrors.filter(
      (err) => err.model === modelName
    ).length;

    // 3. Số lượng hợp lệ thực tế = Tổng provided - Số lượng lỗi
    const validProvided = Math.max(0, totalProvidedInExcel - invalidCount);

    // 4. Tính độ lệch
    const difference = validProvided - requestedQty;

    return {
      validProvided,
      difference,
    };
  };

  // Điều kiện để nút Ship sáng lên
  const canShip = validationResult && validationResult.isValid;

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <div className="popup-header">
          <h3>Parts Request Details - {request.status}</h3>
        </div>

        <div className="popup-body">
          {/* 1. INFO SECTION */}
          <div
            style={{
              display: "block",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "10px",
            }}
          >
            <div>
              <div
                className="info-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* <strong>Status:</strong>
                <span className="status-badge status-confirmed">
                  {request.status}
                </span> */}
              </div>
              <div className="info-row">
                <strong>Service Center:</strong> {request.serviceCenter}
              </div>
              <div className="info-row">
                <strong>Requested By:</strong> {request.requestedBy}
              </div>
              <div className="info-row">
                <strong>Requested Date:</strong>{" "}
                {formatDateTime(request.requestDate)}
              </div>
            </div>
            <div>
              {request.notes && (
                <div
                  style={{
                    background: "#edf2f7",
                    padding: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <strong>Note:</strong>{" "}
                  <span style={{ fontSize: "0.9rem" }}>{request.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. REQUESTED PARTS TABLE */}
          <h4 style={{ marginTop: "10px", marginBottom: "5px" }}>
            Requested Parts
          </h4>
          <table className="parts-detail">
            <thead>
              <tr>
                <th>Part Model</th>
                <th style={{ textAlign: "center" }}>Req Qty</th>
                <th style={{ textAlign: "center" }}>OEM Stock</th>

                {/* Cột kết quả kiểm tra (chỉ hiện khi đã validate) */}
                {validationResult && (
                  <>
                    <th
                      style={{
                        textAlign: "center",
                        background: "#fff7ed",
                        color: "#c05621",
                        borderBottom: "2px solid #fbd38d",
                      }}
                    >
                      Provided (Valid)
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        background: "#fff7ed",
                        color: "#c05621",
                        borderBottom: "2px solid #fbd38d",
                      }}
                    >
                      Result
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {request.parts?.map((p, i) => {
                const statusData = getRowStatus(p.model, p.requestedQty);
                const isRowValidated = validationResult != null;

                return (
                  <tr key={i}>
                    <td>{p.model}</td>
                    <td style={{ textAlign: "center" }}>{p.requestedQty}</td>
                    <td style={{ textAlign: "center" }}>{p.oemStock}</td>

                    {isRowValidated && (
                      <>
                        <td
                          style={{
                            textAlign: "center",
                            background: "#fff7ed",
                            fontWeight: "bold",
                          }}
                        >
                          {statusData.validProvided}
                        </td>
                        <td
                          style={{ textAlign: "center", background: "#fff7ed" }}
                        >
                          {statusData.difference === 0 ? (
                            <span
                              style={{ color: "green", fontWeight: "bold" }}
                            >
                              ✔ OK
                            </span>
                          ) : statusData.difference < 0 ? (
                            // Thiếu -> Hiện Missing + số dương
                            <span style={{ color: "red", fontWeight: "bold" }}>
                              Missing {Math.abs(statusData.difference)}
                            </span>
                          ) : (
                            // Thừa -> Hiện Extra
                            <span
                              style={{ color: "#d69e2e", fontWeight: "bold" }}
                            >
                              Extra {statusData.difference}
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div
            className="info-row"
            style={{ marginTop: "15px", fontSize: "1rem" }}
          >
            <strong>Expected Delivery Date:</strong>{" "}
            <span style={{ color: "#2b6cb0" }}>
              {request.expectedDate || "Not set"}
            </span>
          </div>

          {/* 3. TIMELINE */}
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#fafbfc",
            }}
          >
            <Timeline request={request} />
          </div>

          {/* 4. PROCESS SHIPMENT (Upload & Validate) */}
          <div className="validation-section">
            <h4 style={{ margin: "0 0 12px 0", color: "#2d3748" }}>
              Process Shipment
            </h4>

            <div className="import-excel-wrapper">
              <div
                className="upload-dashed-box"
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  onClick={onInputClick}
                  style={{ display: "none" }}
                />
                <div className="upload-icon">☁️</div>
                <div>
                  {selectedFile ? (
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>
                      📄 {selectedFile.name}
                    </div>
                  ) : (
                    <span style={{ color: "#64748b" }}>No file selected</span>
                  )}
                </div>
                <div className="upload-btn-label">
                  {selectedFile
                    ? "📂 Change File"
                    : "📤 Upload Excel to Validate"}
                </div>
                <div className="upload-hint">
                  *Upload Excel file to validate serials before shipping
                </div>
              </div>

              {/* NÚT 1: VALIDATE FILE */}
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <button
                  className="btn-confirm"
                  onClick={handleValidateOnly}
                  disabled={!selectedFile || isValidating}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    backgroundColor: "#3182ce", // Màu xanh dương
                    opacity: !selectedFile || isValidating ? 0.6 : 1,
                    cursor:
                      !selectedFile || isValidating ? "not-allowed" : "pointer",
                  }}
                >
                  {isValidating ? "Checking..." : "Validate File"}
                </button>
              </div>
            </div>

            {/* ERROR DISPLAY (Giao diện bảng chi tiết) */}
            {validationResult && !validationResult.isValid && (
              <div className="validation-result" style={{ marginTop: "12px" }}>
                <div className="validation-error">
                  <div className="validation-error-title">
                    <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                    <span>
                      Validation Failed: Found{" "}
                      {validationResult.serialErrors?.length || 0} issue(s)
                    </span>
                  </div>

                  {/* Lỗi chung */}
                  {validationResult.errors?.length > 0 && (
                    <ul
                      className="error-list"
                      style={{ marginBottom: "16px", color: "#dc2626" }}
                    >
                      {validationResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}

                  {/* Bảng chi tiết lỗi Serial */}
                  {validationResult.serialErrors?.length > 0 && (
                    <div className="error-table-wrapper">
                      <table className="error-table">
                        <thead>
                          <tr>
                            <th>Part Model</th>
                            <th>Serial Number</th>
                            <th>Error Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.serialErrors.map((err, idx) => (
                            <tr key={idx}>
                              <td className="col-model">{err.model}</td>
                              <td className="col-serial">{err.serialNumber}</td>
                              <td className="col-message">
                                {/* Badge Loại lỗi (Tách chữ hoa) */}
                                <div className="error-type-badge">
                                  {err.errorType
                                    ?.replace(/([A-Z])/g, " $1")
                                    .trim() || "Error"}
                                </div>
                                {/* Message chi tiết */}
                                <span className="error-message-text">
                                  {err.message}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Cảnh báo lệch số lượng */}
                  {Object.keys(validationResult.quantityDiscrepancies || {})
                    .length > 0 && (
                    <div
                      style={{
                        marginTop: "12px",
                        color: "#c53030",
                        fontStyle: "italic",
                        fontSize: "0.9rem",
                        paddingLeft: "4px",
                      }}
                    >
                      * Also check the "Requested Parts" table above for
                      quantity mismatches.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUCCESS DISPLAY */}
            {validationResult && validationResult.isValid && (
              <div className="validation-success" style={{ marginTop: "12px" }}>
                ✅ <strong>Validation Passed!</strong> Ready to ship.
              </div>
            )}
          </div>

          {/* 5. FOOTER ACTIONS */}
          <div className="popup-actions">
            <button
              className="btn-secondary btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Close
            </button>

            {/* NÚT 2: SHIP PARTS (Chỉ active khi canShip = true) */}
            <button
              className="btn-confirm"
              onClick={handleShipClick}
              disabled={isLoading || !canShip}
              style={{
                opacity: isLoading || !canShip ? 0.6 : 1,
                cursor: isLoading || !canShip ? "not-allowed" : "pointer",
                minWidth: "160px",
                backgroundColor: canShip ? "#38a169" : "#a0aec0", // Xanh lá nếu OK, xám nếu chưa OK
              }}
            >
              {isLoading ? "Processing..." : "Ship Parts 🚚"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Shipment"
        message="All serial numbers are valid. Are you sure you want to confirm shipment?"
        confirmLabel="Yes, Ship It"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDialog}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isLoading}
      />
    </div>
  );
}
