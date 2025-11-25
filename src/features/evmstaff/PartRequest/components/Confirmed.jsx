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
      setValidationResult(null);
    }
  };

  const handleValidateClick = async () => {
    if (!selectedFile) {
      toast.warning("Please select an Excel file first.");
      return;
    }

    setIsValidating(true);
    const res = await onValidate(request.orderId, selectedFile);
    setIsValidating(false);

    if (res.success) {
      setValidationResult(res.data);
      if (res.data.isValid) {
        toast.success("File is valid! Ready to ship.");
      } else {
        toast.error("Validation failed. Please check errors.");
      }
    } else {
      if (res.data || res.errors || res.quantityDiscrepancies) {
        setValidationResult(res.data || res);
      }
      toast.error(res.message || "Validation error.");
    }
  };

  const handleShipClick = () => setIsConfirmOpen(true);
  const handleConfirmDialog = () => {
    setIsConfirmOpen(false);
    onDelivered(request.orderId);
  };

  // --- HELPER: Lấy dữ liệu Discrepancy cho từng Model ---
  const getDiscrepancyInfo = (modelName) => {
    if (!validationResult || !validationResult.quantityDiscrepancies)
      return null;
    // Tìm object có model trùng khớp
    const disc = Object.values(validationResult.quantityDiscrepancies).find(
      (d) => d.model === modelName
    );
    return disc;
  };

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <div className="popup-header">
          <h3>Parts Request Details - {request.orderId.substring(0, 8)}</h3>
        </div>

        <div className="popup-body">
          {/* 1. Thông tin chung */}
          <div
            style={{
              display: "grid",
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
                <strong>Status:</strong>
                <span
                  className="status-badge status-confirmed"
                  style={{
                    minWidth: "auto",
                    padding: "4px 12px",
                    fontSize: "0.85rem",
                  }}
                >
                  {request.status}
                </span>
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

          {/* 2. Bảng hàng hóa (CẬP NHẬT: TÍCH HỢP DISCREPANCY) */}
          <h4 style={{ marginTop: "10px", marginBottom: "5px" }}>
            Requested Parts
          </h4>
          <table className="parts-detail">
            <thead>
              <tr>
                <th>Part Model</th>
                <th style={{ textAlign: "center" }}>Req Qty</th>
                <th style={{ textAlign: "center" }}>OEM Stock</th>

                {/* Chỉ hiện cột này khi đã Validate và có lỗi số lượng */}
                {validationResult && !validationResult.isValid && (
                  <>
                    <th
                      style={{
                        textAlign: "center",
                        background: "#fff5f5",
                        color: "#c53030",
                      }}
                    >
                      Provided
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        background: "#fff5f5",
                        color: "#c53030",
                      }}
                    >
                      Diff
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {request.parts?.map((p, i) => {
                const disc = getDiscrepancyInfo(p.model);
                return (
                  <tr key={i}>
                    <td>{p.model}</td>
                    <td style={{ textAlign: "center" }}>{p.requestedQty}</td>
                    <td style={{ textAlign: "center" }}>{p.oemStock}</td>

                    {/* Hiển thị thông tin validate nếu có lỗi */}
                    {validationResult && !validationResult.isValid && (
                      <>
                        <td
                          style={{
                            textAlign: "center",
                            background: "#fff5f5",
                            fontWeight: "bold",
                          }}
                        >
                          {disc ? disc.provided : "-"}
                        </td>
                        <td
                          style={{ textAlign: "center", background: "#fff5f5" }}
                        >
                          {disc ? (
                            <span
                              style={{
                                color: disc.difference < 0 ? "red" : "blue",
                                fontWeight: "bold",
                              }}
                            >
                              {disc.difference > 0
                                ? `+${disc.difference}`
                                : disc.difference}
                            </span>
                          ) : (
                            <span style={{ color: "green" }}>OK</span>
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

          {/* 3. Timeline */}
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

          {/* 4. VALIDATION SECTION */}
          <div className="validation-section">
            <h4 style={{ marginTop: 0 }}>Process Shipment</h4>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#718096",
                marginBottom: "10px",
              }}
            >
              Upload Excel file to validate serial numbers before shipping.
            </p>

            <div className="file-upload-wrapper">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <button
                className="btn-secondary"
                onClick={() => fileInputRef.current.click()}
              >
                {selectedFile ? "📂 Change File" : "📂 Choose File"}
              </button>
              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                {selectedFile ? selectedFile.name : "No file chosen"}
              </span>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <button
                className="btn-import-excel"
                onClick={handleValidateClick}
                disabled={!selectedFile || isValidating}
              >
                {isValidating ? "Checking..." : "📤 Import & Validate File"}
              </button>
            </div>

            {/* KẾT QUẢ VALIDATE (Chỉ còn Serial Errors & General Errors) */}
            {validationResult && (
              <div className="validation-result">
                {validationResult.isValid ? (
                  <div className="validation-success">
                    ✅ <strong>Validation Passed!</strong> Ready to ship.
                  </div>
                ) : (
                  <div className="validation-error">
                    <strong style={{ display: "block", marginBottom: "5px" }}>
                      ⚠️ Validation Failed:
                    </strong>

                    {/* 1. Lỗi chung */}
                    {validationResult.errors?.length > 0 && (
                      <ul className="error-list">
                        {validationResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}

                    {/* 2. Lỗi Serial (YÊU CẦU 2 - GIỮ NGUYÊN Ở DƯỚI) */}
                    {validationResult.serialErrors &&
                      validationResult.serialErrors.length > 0 && (
                        <div style={{ marginTop: "10px" }}>
                          <strong
                            style={{ color: "#c53030", fontSize: "0.9rem" }}
                          >
                            Serial Number Errors:
                          </strong>
                          <div
                            style={{
                              marginTop: "5px",
                              maxHeight: "150px",
                              overflowY: "auto",
                              border: "1px solid #fed7d7",
                              borderRadius: "6px",
                            }}
                          >
                            <table
                              className="parts-detail"
                              style={{ margin: 0, background: "white" }}
                            >
                              <thead style={{ position: "sticky", top: 0 }}>
                                <tr>
                                  <th>Model</th>
                                  <th>Serial</th>
                                  <th>Message</th>
                                </tr>
                              </thead>
                              <tbody>
                                {validationResult.serialErrors.map(
                                  (err, idx) => (
                                    <tr key={idx}>
                                      <td style={{ fontWeight: 500 }}>
                                        {err.model}
                                      </td>
                                      <td style={{ fontFamily: "monospace" }}>
                                        {err.serialNumber}
                                      </td>
                                      <td style={{ color: "#e53e3e" }}>
                                        {err.message}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Footer Actions */}
          <div className="popup-actions">
            <button
              className="btn-secondary btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Close
            </button>
            <button
              className="btn-confirm"
              onClick={handleShipClick}
              disabled={isLoading || !validationResult?.isValid}
              style={{
                opacity: !validationResult?.isValid ? 0.5 : 1,
                cursor: !validationResult?.isValid ? "not-allowed" : "pointer",
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
        message="Are you sure you want to verify shipment and change status to In Transit?"
        confirmLabel="Yes, Ship It"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDialog}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isLoading}
      />
    </div>
  );
}
