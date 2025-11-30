import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import {
  request as apiRequest,
  uploadFiles,
  ApiEnum,
} from "../../../../services/NetworkUntil";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { Button } from "../../../../components/atoms/Button/Button";
import "./PartsListEVM.css";
import "../../../scstaff/Parts Requests/components/PartsRequest.css";

const formatDate = (dateStr) => {
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

// --- TIMELINE COMPONENT ---
const Timeline = ({ request: requestData }) => {
  if (!requestData) return null;
  const steps = [
    { label: "Request Created", date: requestData.requestDate, active: true },
    {
      label: "Confirmed",
      date: requestData.approvedDate,
      active: !!requestData.approvedDate,
    },
    {
      label: "Shipped",
      date: requestData.shippedDate,
      active: !!requestData.shippedDate,
    },
    { label: "Returning", date: requestData.lastUpdated, active: true },
    {
      label: "Return Inspection",
      date: new Date().toISOString(),
      active: true,
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
                <p>{formatDate(step.date)}</p>
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

export default function ReturnInspection({
  request: requestData,
  onClose,
  onRefresh,
}) {
  // 1. KHAI BÁO TẤT CẢ HOOKS Ở ĐẦU (TRƯỚC KHI RETURN)
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const [incidentItems, setIncidentItems] = useState([]);
  const [serialMap, setSerialMap] = useState({});
  const [modelsList, setModelsList] = useState([]);

  const fetchingSerialsRef = useRef(new Set());
  const fileInputRef = useRef(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Lấy Order ID an toàn (dùng optional chaining để tránh lỗi khi requestData null)
  const orderId = requestData?.orderId;

  // --- HELPER: LẤY MODELS (Dùng useCallback để fix dependency warning) ---
  const fetchReturnModels = useCallback(async () => {
    if (!orderId) return; // Guard clause

    try {
      const response = await apiRequest(ApiEnum.GET_RETURN_SHIPMENT_MODELS, {
        params: { orderId: orderId },
      });
      if (response.success) {
        setModelsList(response.data || []);
      } else {
        const fallbackModels = requestData?.parts?.map((p) => p.model) || [];
        setModelsList(fallbackModels);
      }
    } catch (error) {
      console.error("Fetch return models error:", error);
      const fallbackModels = requestData?.parts?.map((p) => p.model) || [];
      setModelsList(fallbackModels);
    }
  }, [orderId, requestData]); // Dependencies

  // --- HELPER: LẤY SERIALS ---

  const fetchSerials = async (modelName) => {
    if (!modelName || !orderId) return;
    if (fetchingSerialsRef.current.has(modelName)) return;

    fetchingSerialsRef.current.add(modelName);
    try {
      const response = await apiRequest(ApiEnum.GET_RETURN_SHIPMENT_SERIALS, {
        params: { orderId: orderId },
        model: modelName,
      });
      if (response.success) {
        setSerialMap((prev) => ({ ...prev, [modelName]: response.data || [] }));
      } else {
        setSerialMap((prev) => ({ ...prev, [modelName]: [] }));
      }
    } catch (error) {
      console.error("Fetch return serials error:", error);
      setSerialMap((prev) => ({ ...prev, [modelName]: [] }));
    } finally {
      fetchingSerialsRef.current.delete(modelName);
    }
  };

  // --- USE EFFECT (Gọi API khi component mount) ---
  useEffect(() => {
    if (orderId) {
      fetchReturnModels();
    }
  }, [fetchReturnModels, orderId]);

  // 2. BÂY GIỜ MỚI ĐƯỢC CHECK NULL VÀ RETURN
  if (!requestData) return null;

  // --- HANDLERS FORM ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setValidationResult(null);
  };

  const addIncidentRow = () => {
    setIncidentItems([
      ...incidentItems,
      { partModel: "", serial: "", note: "", image: null, previewUrl: null },
    ]);
  };
  const removeIncidentRow = (index) => {
    setIncidentItems(incidentItems.filter((_, i) => i !== index));
  };
  const handleIncidentChange = (index, field, value) => {
    const newItems = [...incidentItems];
    newItems[index][field] = value;
    if (field === "partModel") {
      newItems[index].serial = "";
      if (value) fetchSerials(value);
    }
    setIncidentItems(newItems);
  };
  const handleIncidentImageUpload = (index, file) => {
    if (!file) return;
    const newItems = [...incidentItems];
    newItems[index].image = file;
    newItems[index].previewUrl = URL.createObjectURL(file);
    setIncidentItems(newItems);
  };

  // --- API ACTIONS ---
  const handleValidateReturn = async () => {
    if (!selectedFile) return toast.warning("Please select a file");
    setIsLoading(true);
    setValidationResult(null);

    try {
      const payload = {
        params: { orderId: requestData.orderId },
        file: selectedFile,
      };
      const response = await uploadFiles(ApiEnum.VALIDATE_RETURN, payload); // Hoặc VALIDATE_RECEIPT tùy backend
      const resultData = response.data || response.responseData;

      if (response.success) {
        setValidationResult(resultData);
        const isClean =
          resultData?.isValid ||
          ((!resultData?.serialMismatches ||
            resultData?.serialMismatches.length === 0) &&
            (!resultData?.errors || resultData?.errors.length === 0));

        if (isClean) toast.success("File is valid!");
        else toast.warning("Validation completed with issues.");

        await fetchReturnModels();
        if (modelsList.length > 0) modelsList.forEach((m) => fetchSerials(m));
      } else {
        if (resultData) {
          setValidationResult(resultData);
          toast.error("Validation failed. See details.");
        } else {
          toast.error(response.message || "Validation failed");
        }
      }
    } catch (err) {
      console.error("Return Validation Error:", err);
      let serverResponse = err.responseData || err.response?.data;
      let errorData = null;

      if (serverResponse) {
        if (
          serverResponse.data &&
          (serverResponse.data.serialMismatches ||
            serverResponse.data.isValid !== undefined)
        ) {
          errorData = serverResponse.data;
        } else if (
          serverResponse.serialMismatches ||
          serverResponse.isValid !== undefined
        ) {
          errorData = serverResponse;
        }
      }

      if (errorData) {
        setValidationResult(errorData);
        toast.error("Validation failed.");
      } else {
        toast.error("Error validating file.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmInspection = async () => {
    setIsLoading(true);
    const payload = { params: { orderId: requestData.orderId } };
    const validIncidents = incidentItems.filter(
      (item) => item.partModel && item.serial
    );

    if (validIncidents.length > 0) {
      const damagedPartsJson = validIncidents.map((item) => ({
        model: item.partModel,
        serialNumber: item.serial,
        note: item.note || "Reported damage during return inspection",
      }));
      payload.damagedPartsJson = JSON.stringify(damagedPartsJson);
      const images = [];
      validIncidents.forEach((item) => {
        if (item.image) images.push(item.image);
      });
      if (images.length > 0) payload.images = images;
    } else {
      payload.damagedPartsJson = "[]";
    }

    try {
      const response = await uploadFiles(ApiEnum.CONFIRM_RETURN, payload);
      if (response.success) {
        toast.success("Return inspection completed! Request Closed.");
        onRefresh && onRefresh();
        onClose();
      } else {
        toast.error(response.message || "Failed to confirm inspection.");
      }
    } catch (err) {
      console.error(err);
      toast.error("System error while confirming.");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const renderValidationResult = () => {
    if (!validationResult) return null;
    const { isValid, errors } = validationResult;
    const serialErrors =
      validationResult.serialMismatches || validationResult.serialErrors || [];

    const isClean =
      isValid ||
      (serialErrors.length === 0 && (!errors || errors.length === 0));

    if (isClean)
      return (
        <div className="validation-success" style={{ marginTop: 12 }}>
          ✅ Validation Passed!
        </div>
      );

    return (
      <div className="validation-error" style={{ marginTop: 12 }}>
        <div className="validation-error-header">
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <span>
            Validation Failed: Found{" "}
            {serialErrors.length + (errors?.length || 0)} issue(s)
          </span>
        </div>

        {errors?.length > 0 && (
          <div style={{ padding: "16px 20px" }}>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#dc2626" }}>
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {serialErrors.length > 0 && (
          <div className="error-table-container">
            <table className="error-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Serial</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {serialErrors.map((item, idx) => (
                  <tr key={idx}>
                    <td className="col-model">{item.model}</td>
                    <td className="col-serial">{item.serialNumber || "N/A"}</td>
                    <td className="col-message">
                      <span className="error-text">{item.message}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="popup-overlay">
        <div className="popup-card returning">
          <div
            className="popup-header"
            style={{ borderBottomColor: "#805ad5" }}
          >
            <h3>Return Inspection - {requestData.status}</h3>
          </div>

          <div className="popup-body">
            {/* INFO */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <div className="info-row">
                  <strong>Service Center:</strong>{" "}
                  {requestData.serviceCenterName || requestData.serviceCenter}
                </div>
                <div className="info-row">
                  <strong>Requested By:</strong>{" "}
                  {requestData.requestedBy || requestData.createdByName}
                </div>
                <div className="info-row">
                  <strong>Requested Date:</strong>{" "}
                  {formatDate(requestData.requestDate)}
                </div>
              </div>
              <div>
                <div className="info-row">
                  <strong>Expected Delivery:</strong>{" "}
                  <span style={{ color: "#2b6cb0" }}>
                    {formatDate(requestData.expectedDate)}
                  </span>
                </div>
                {requestData.notes && (
                  <div
                    style={{
                      background: "#f3f4f6",
                      padding: "8px",
                      borderRadius: "4px",
                      marginTop: "8px",
                    }}
                  >
                    <strong>Note:</strong> {requestData.notes}
                  </div>
                )}
              </div>
            </div>

            {/* TABLE */}
            <h4 style={{ marginTop: "15px", marginBottom: "5px" }}>
              Requested Parts
            </h4>
            <table className="parts-detail">
              <thead>
                <tr>
                  <th>Part Model</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "center" }}>OEM Stock</th>
                </tr>
              </thead>
              <tbody>
                {requestData.parts?.map((p, i) => (
                  <tr key={i}>
                    <td>{p.model}</td>
                    <td style={{ textAlign: "center" }}>{p.requestedQty}</td>
                    <td style={{ textAlign: "center" }}>{p.oemStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: "#fafbfc",
              }}
            >
              <Timeline request={requestData} />
            </div>

            <hr
              style={{
                margin: "20px 0",
                border: "0",
                borderTop: "1px solid #e2e8f0",
              }}
            />

            {/* VALIDATE */}
            <div
              className="inventory-section"
              style={{ border: "none", padding: 0 }}
            >
              <h4 style={{ marginBottom: "12px", color: "#334155" }}>
                1. Validate Return Receipt
              </h4>
              <div
                className="upload-dashed-box"
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  style={{ display: "none" }}
                />
                <div className="upload-icon">📥</div>
                <div>
                  {selectedFile ? (
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>
                      📄 {selectedFile.name}
                    </div>
                  ) : (
                    "Select File"
                  )}
                </div>
                <div className="upload-btn-label">Upload File</div>
              </div>
              <div style={{ marginTop: "12px", textAlign: "center" }}>
                <Button
                  variant="primary"
                  onClick={handleValidateReturn}
                  isLoading={isLoading}
                  disabled={!selectedFile}
                >
                  Validate File
                </Button>
              </div>
              {renderValidationResult()}
            </div>

            {/* INCIDENT REPORT */}
            <div
              className="incident-report-container"
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h4 style={{ margin: 0, color: "#334155" }}>
                  2. Report Damaged/Missing Items
                </h4>
                <Button variant="light" size="small" onClick={addIncidentRow}>
                  ➕ Add Item
                </Button>
              </div>
              <p className="text-muted small mb-3">
                Leave empty if everything is good.
              </p>
              {incidentItems.map((item, index) => (
                <div className="incident-row" key={index}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Part Model</label>
                    <select
                      className="form-select"
                      value={item.partModel}
                      onChange={(e) =>
                        handleIncidentChange(index, "partModel", e.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      {modelsList && modelsList.length > 0 ? (
                        modelsList.map((m, idx) => (
                          <option key={idx} value={m}>
                            {m}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading...</option>
                      )}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 3 }}>
                    <label>Serial</label>
                    <select
                      className="form-select"
                      value={item.serial}
                      onChange={(e) =>
                        handleIncidentChange(index, "serial", e.target.value)
                      }
                      disabled={!item.partModel}
                    >
                      <option value="">Select Serial...</option>
                      {serialMap[item.partModel] &&
                      serialMap[item.partModel].length > 0 ? (
                        serialMap[item.partModel].map((sn, i) => (
                          <option key={i} value={sn}>
                            {sn}
                          </option>
                        ))
                      ) : (
                        <option disabled>
                          {item.partModel
                            ? serialMap[item.partModel] === undefined
                              ? "Loading..."
                              : "No serials found"
                            : "Select Model First"}
                        </option>
                      )}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 3 }}>
                    <label>Note</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.note}
                      onChange={(e) =>
                        handleIncidentChange(index, "note", e.target.value)
                      }
                    />
                  </div>
                  <div
                    className="form-group incident-image-group"
                    style={{ flex: 1 }}
                  >
                    <label>Image</label>
                    <div
                      className="image-upload-box"
                      onClick={() =>
                        document.getElementById(`ret-img-${index}`).click()
                      }
                    >
                      <input
                        type="file"
                        id={`ret-img-${index}`}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) =>
                          handleIncidentImageUpload(index, e.target.files[0])
                        }
                      />
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          className="preview-image-mini"
                          alt="preview"
                        />
                      ) : (
                        <span>📷</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn-remove-row"
                    onClick={() => removeIncidentRow(index)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="popup-actions" style={{ marginTop: "30px" }}>
              <button
                className="btn-secondary btn-cancel"
                onClick={onClose}
                disabled={isLoading}
              >
                Close
              </button>
              <button
                className="btn-confirm"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isLoading}
                style={{ backgroundColor: "#805ad5", minWidth: "200px" }}
              >
                {isLoading ? "Processing..." : "✅ Complete Inspection"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Complete Return Inspection"
        message="Confirm completion?"
        confirmLabel="Yes, Complete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmInspection}
        onCancel={() => setShowConfirmDialog(false)}
        isLoading={isLoading}
      />
    </>
  );
}

ReturnInspection.propTypes = {
  request: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onRefresh: PropTypes.func,
};
