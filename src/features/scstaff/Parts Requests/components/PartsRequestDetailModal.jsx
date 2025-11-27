import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { DetailModalActions } from "../../../../components/molecules/DetailModalActions/DetailModalActions";
import { Button } from "../../../../components/atoms/Button/Button";
import { formatDate } from "../../../../services/helpers";
import {
  request,
  uploadFiles,
  ApiEnum,
} from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";
import "./PartsRequest.css";

// Constants
const CANCEL_REASONS = [
  { value: "AccidentTotalDamage", label: "Accident / Total Loss" },
  { value: "TheftOrLost", label: "Theft / Lost" },
  { value: "FireExplosion", label: "Fire / Explosion" },
  { value: "NaturalDisaster", label: "Natural Disaster" },
  { value: "Other", label: "Other (Specify below)" },
];
const RETURN_REASONS = [
  { value: "DeliveryRefused", label: "Delivery Refused" },
  { value: "WrongAddressUnreachable", label: "Wrong Address / Unreachable" },
  { value: "ServiceCenterClosed", label: "SC Temporarily Closed" },
  { value: "CancelledBySC", label: "Cancelled by SC" },
  { value: "Other", label: "Other (Specify below)" },
];

export const PartsRequestDetailModal = ({
  isOpen,
  onClose,
  requestData,
  onRefresh,
}) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [incidentItems, setIncidentItems] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // Data State
  const [serialMap, setSerialMap] = useState({});
  const [shipmentModels, setShipmentModels] = useState([]);

  // Ref
  const fetchingSerialsRef = useRef(new Set());
  const fileInputRef = useRef(null);

  // Action State
  const [showActionModal, setShowActionModal] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [actionReasonDetail, setActionReasonDetail] = useState("");
  const [actionNote, setActionNote] = useState("");

  if (!requestData) return null;

  // Đảm bảo lấy đúng ID
  const requestID =
    requestData.requestID || requestData.orderId || requestData.id;
  const { status, partOrderItems = [], timeline = [] } = requestData;
  const currentStatus = (status || "").trim();

  useEffect(() => {
    if (isOpen) {
      setValidationResult(null);
      setSelectedFile(null);
      setIncidentItems([]);
      setSerialMap({});

      // [FIX QUAN TRỌNG] Load model từ items có sẵn ngay lập tức để tránh UI bị treo "Loading..."
      // Nếu API shipment-models chạy xong sau đó, nó sẽ update đè lên.
      if (partOrderItems && partOrderItems.length > 0) {
        const defaultModels = partOrderItems
          .map((p) => p.model)
          .filter(Boolean);
        setShipmentModels(defaultModels);
      }

      fetchingSerialsRef.current.clear();

      setShowActionModal(null);
      setActionReason("");
      setActionReasonDetail("");
      setActionNote("");

      if (currentStatus === "Delivered") {
        fetchShipmentModels();
      }
    }
  }, [isOpen, requestData]);

  // --- 1. API LẤY MODELS ---
  const fetchShipmentModels = async () => {
    if (!requestID) return;
    try {
      const response = await request(ApiEnum.GET_SHIPMENT_MODELS, {
        params: { orderId: requestID },
      });

      if (
        response.success &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setShipmentModels(response.data);
      }
    } catch (error) {
      console.error("Fetch models error (UI using fallback):", error);
    }
  };

  // --- 2. API LẤY SERIALS ---
  const fetchSerials = async (modelName) => {
    if (!modelName) return;
    if (!requestID) {
      console.error("Missing Request ID");
      return;
    }

    // Chặn spam click
    if (fetchingSerialsRef.current.has(modelName)) {
      return;
    }

    fetchingSerialsRef.current.add(modelName);

    try {
      console.log(`📡 Fetching serials for ${modelName}...`);
      const response = await request(ApiEnum.GET_SHIPMENT_SERIALS, {
        params: { orderId: requestID },
        model: modelName,
      });

      if (response.success) {
        setSerialMap((prev) => ({ ...prev, [modelName]: response.data || [] }));
      } else {
        setSerialMap((prev) => ({ ...prev, [modelName]: [] }));
      }
    } catch (error) {
      console.error("Fetch serials error:", error);
      setSerialMap((prev) => ({ ...prev, [modelName]: [] }));
    } finally {
      fetchingSerialsRef.current.delete(modelName);
    }
  };

  const getSerialOptions = (modelName) => serialMap[modelName];

  // --- HELPER: TÍNH TOÁN TRẠNG THÁI ROW ---
  const getRowStatus = (modelName, requestedQty) => {
    if (!validationResult) return null;

    const { quantityDiscrepancies = {}, isValid } = validationResult;
    // Lấy lỗi từ 1 trong 2 key có thể (data backend trả về)
    const serialErrors =
      validationResult.serialMismatches || validationResult.serialErrors || [];

    const isActuallyValid =
      isValid ||
      (serialErrors.length === 0 &&
        (!quantityDiscrepancies ||
          Object.keys(quantityDiscrepancies).length === 0));

    let discrepancy = null;
    if (quantityDiscrepancies) {
      discrepancy =
        quantityDiscrepancies[modelName] ||
        Object.values(quantityDiscrepancies).find((d) => d.model === modelName);
    }

    let totalProvidedInCsv = discrepancy
      ? discrepancy.provided
      : isActuallyValid
      ? requestedQty
      : 0;

    const invalidCount = serialErrors
      ? serialErrors.filter((err) => err.model === modelName).length
      : 0;

    const validProvided = Math.max(0, totalProvidedInCsv - invalidCount);
    const difference = validProvided - requestedQty;

    return {
      validProvided,
      difference,
    };
  };

  // --- HANDLERS ---
  const handleIncidentChange = (index, field, value) => {
    const newItems = [...incidentItems];
    newItems[index][field] = value;

    if (field === "partModel") {
      newItems[index].serial = "";

      // [FIXED] Bỏ điều kiện && validationResult để luôn cho phép gọi API
      if (value) {
        fetchSerials(value);
      }
    }
    setIncidentItems(newItems);
  };

  const addIncidentRow = () =>
    setIncidentItems([
      ...incidentItems,
      { partModel: "", serial: "", note: "", image: null, previewUrl: null },
    ]);
  const removeIncidentRow = (i) =>
    setIncidentItems(incidentItems.filter((_, idx) => idx !== i));

  const handleIncidentImageUpload = (i, f) => {
    if (!f) return;
    const n = [...incidentItems];
    n[i].image = f;
    n[i].previewUrl = URL.createObjectURL(f);
    setIncidentItems(n);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setValidationResult(null);
  };

  // --- API ACTIONS ---
  const handleValidateReceipt = async () => {
    if (!selectedFile) return toast.warning("Please select a file");
    setIsLoading(true);
    setValidationResult(null);

    try {
      const payload = { params: { orderId: requestID }, file: selectedFile };
      const response = await uploadFiles(ApiEnum.VALIDATE_RECEIPT, payload);

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
      } else {
        if (resultData) {
          setValidationResult(resultData);
          toast.error("Validation failed. See details below.");
        } else {
          toast.error(response.message || "Validation failed");
        }
      }

      // [FIX] Tự động load serial cho tất cả model sau khi upload xong
      if (partOrderItems && partOrderItems.length > 0) {
        partOrderItems.forEach((item) => {
          if (item.model) fetchSerials(item.model);
        });
      }
    } catch (err) {
      console.error("Validation Error:", err);
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
        toast.error("Validation failed. See details below.");

        // [FIX] Auto fetch kể cả khi lỗi validate để user còn chọn được serial mà báo lỗi
        if (partOrderItems) {
          partOrderItems.forEach(
            (item) => item.model && fetchSerials(item.model)
          );
        }
      } else {
        toast.error("Error validating file.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledgeReceipt = async () => {
    setIsLoading(true);
    try {
      const response = await request(
        ApiEnum.ACKNOWLEDGE_RECEIPT,
        { params: { orderId: requestID } },
        "PUT"
      );
      if (response.success) {
        toast.success("Receipt Acknowledged!");
        onRefresh();
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("System error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    setIsLoading(true);
    const payload = { params: { orderId: requestID } };
    const validIncidents = incidentItems.filter(
      (item) => item.partModel && item.serial
    );

    if (validIncidents.length > 0) {
      const damagedPartsJson = validIncidents.map((item) => ({
        model: item.partModel,
        serialNumber: item.serial,
        note: item.note || "Reported damage",
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
      const response = await uploadFiles(ApiEnum.CONFIRM_RECEIPT, payload);
      if (response.success) {
        toast.success("Confirmed!");
        onRefresh();
        onClose();
      } else toast.error(response.message);
    } catch {
      toast.error("Error confirming");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAction = async () => {
    if (!actionReason) return toast.warning("Please select a reason");
    if (actionReason === "Other" && !actionReasonDetail.trim())
      return toast.warning("Please enter reason detail");
    setIsLoading(true);
    const payload = {
      params: { orderId: requestID },
      reason: actionReason,
      reasonDetail: actionReason === "Other" ? actionReasonDetail : null,
      note: actionNote,
    };
    const endpoint =
      showActionModal === "CANCEL"
        ? ApiEnum.CANCEL_SHIPMENT
        : ApiEnum.RETURN_SHIPMENT;
    try {
      const response = await request(endpoint, payload, "POST");
      if (response.success) {
        toast.success("Action successful!");
        onRefresh();
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERERS ---

  const renderActionModal = () => {
    if (!showActionModal) return null;
    const isCancel = showActionModal === "CANCEL";
    return (
      <div className="action-modal-overlay">
        <div className="action-modal-content">
          <h3 className={`action-title ${isCancel ? "cancel" : "return"}`}>
            {isCancel ? "❌ Cancel Shipment" : "↩️ Return Shipment"}
          </h3>
          <div className="form-group mb-3">
            <label>
              Reason <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            >
              <option value="">-- Select Reason --</option>
              {(isCancel ? CANCEL_REASONS : RETURN_REASONS).map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {actionReason === "Other" && (
            <div className="form-group mb-3">
              <label>
                Reason Detail <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Please specify..."
                value={actionReasonDetail}
                onChange={(e) => setActionReasonDetail(e.target.value)}
              />
            </div>
          )}
          <div className="form-group mb-3">
            <label>Note</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Note..."
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
            />
          </div>
          <div className="action-buttons">
            <Button variant="light" onClick={() => setShowActionModal(null)}>
              Close
            </Button>
            <Button
              variant={isCancel ? "danger" : "warning"}
              onClick={handleSubmitAction}
              isLoading={isLoading}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    );
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
        <div className="validation-success">
          ✅ Validation Passed! File is valid.
        </div>
      );

    return (
      <div className="validation-error">
        <div className="validation-error-header">
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <span>
            Validation Failed: Found{" "}
            {serialErrors?.length || errors?.length || 0} issue(s)
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

        {serialErrors?.length > 0 && (
          <>
            <div className="error-table-container">
              <table className="error-table">
                <thead>
                  <tr>
                    <th>Part Model</th>
                    <th>Serial Number</th>
                    <th>Error Details</th>
                  </tr>
                </thead>
                <tbody>
                  {serialErrors.map((item, idx) => (
                    <tr key={idx}>
                      <td className="col-model">{item.model}</td>
                      <td className="col-serial">
                        {item.serialNumber || "N/A"}
                      </td>
                      <td className="col-message">
                        <span className="error-badge">
                          {item.errorType?.replace(/([A-Z])/g, " $1").trim() ||
                            "Error"}
                        </span>
                        <span className="error-text">{item.message}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="validation-footer">
              * Also check the "Requested Parts" table above for quantity
              mismatches.
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPartsTable = () => (
    <div className="table-responsive">
      <table className="parts-request-table">
        <thead>
          <tr>
            <th>Part Model</th>
            <th>Req Qty</th>
            <th>SC Stock</th>

            {validationResult && (
              <>
                <th
                  style={{
                    background: "#fff7ed",
                    color: "#c05621",
                    borderBottom: "2px solid #fbd38d",
                  }}
                >
                  Provided (Valid)
                </th>
                <th
                  style={{
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
          {partOrderItems.map((p, i) => {
            const statusData = getRowStatus(p.model, p.requestedQuantity);
            const isRowValidated = validationResult != null;

            return (
              <tr key={i}>
                <td>{p.model}</td>
                <td>{p.requestedQuantity}</td>
                <td>{p.scStock ?? "-"}</td>

                {isRowValidated &&
                  (statusData ? (
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
                          <span style={{ color: "green", fontWeight: "bold" }}>
                            ✔ OK
                          </span>
                        ) : statusData.difference < 0 ? (
                          <span style={{ color: "red", fontWeight: "bold" }}>
                            Missing {Math.abs(statusData.difference)}
                          </span>
                        ) : (
                          <span
                            style={{ color: "#d69e2e", fontWeight: "bold" }}
                          >
                            Extra {statusData.difference}
                          </span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        style={{ textAlign: "center", background: "#fff7ed" }}
                      >
                        -
                      </td>
                      <td
                        style={{ textAlign: "center", background: "#fff7ed" }}
                      >
                        -
                      </td>
                    </>
                  ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderTimeline = () => (
    <div className="timeline-container">
      {timeline.map((item, index) => (
        <div className="timeline-item" key={index}>
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <div className="timeline-title">{item.status}</div>
            <div className="timeline-date">
              {formatDate(item.date, "en-US")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDeliveredContent = () => {
    if (currentStatus !== "Delivered") return null;

    return (
      <div className="inventory-section">
        {/* Upload File */}
        <div className="import-csv-wrapper">
          <h4 style={{ marginBottom: "16px", color: "#334155" }}>
            1. Validate Receipt
          </h4>
          <div className="upload-dashed-box">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-csv"
              className="hidden-file-input"
              id="receipt-file"
              style={{ display: "none" }}
            />
            <div className="upload-icon">☁️</div>
            <div>
              {selectedFile ? (
                <div style={{ fontWeight: 600, color: "#0f172a" }}>
                  📄 {selectedFile.name}
                </div>
              ) : (
                "No file selected"
              )}
            </div>

            <label htmlFor="receipt-file" className="upload-btn-label">
              📤 Upload FILE
            </label>
            {/* <div className="upload-hint">*Maximum 20 items per file</div> */}
          </div>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Button
              variant="primary"
              onClick={handleValidateReceipt}
              isLoading={isLoading}
              size="small"
              disabled={!selectedFile}
            >
              Validate File
            </Button>
          </div>

          {renderValidationResult()}
        </div>

        {/* Incident Report */}
        <div className="incident-report-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h4 style={{ margin: 0, color: "#334155" }}>
              2. Report Damaged Items
            </h4>
            <Button variant="light" size="small" onClick={addIncidentRow}>
              ➕ Add Item
            </Button>
          </div>

          <p className="text-muted small mb-3">
            Leave empty if everything is good.
          </p>

          {incidentItems.map((item, index) => {
            const serials = getSerialOptions(item.partModel);
            return (
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
                    {/* [FIXED] Sử dụng danh sách model đã load (bao gồm fallback) */}
                    {shipmentModels.length > 0 ? (
                      shipmentModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading models...</option>
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
                    {serials && serials.length > 0 ? (
                      serials.map((sn, idx) => (
                        <option key={idx} value={sn}>
                          {sn}
                        </option>
                      ))
                    ) : (
                      <option disabled>
                        {item.partModel
                          ? "Loading / No serials"
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
                      document.getElementById(`img-${index}`).click()
                    }
                  >
                    <input
                      type="file"
                      id={`img-${index}`}
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
                  title="Remove"
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={status || "Request Details"}
      size="lg"
      showFooter={false}
    >
      {renderActionModal()}

      <DetailSection title="Requested Parts">
        {renderPartsTable()}
      </DetailSection>

      <DetailSection title="Timeline">{renderTimeline()}</DetailSection>

      {/* Render nội dung chính khi status là Delivered */}
      {renderDeliveredContent()}

      {/* FOOTER ACTIONS */}
      <DetailModalActions onBack={onClose} backLabel="Close">
        {currentStatus === "In Transit" && (
          <div style={{ marginLeft: "auto" }}>
            <Button
              variant="primary"
              onClick={handleAcknowledgeReceipt}
              isLoading={isLoading}
            >
              📦 Acknowledge Receipt
            </Button>
          </div>
        )}

        {currentStatus === "Delivered" && (
          <div style={{ marginLeft: "auto" }}>
            <Button
              variant="success"
              onClick={handleConfirmReceipt}
              isLoading={isLoading}
            >
              ✅ Confirm Receipt
            </Button>
          </div>
        )}
      </DetailModalActions>
    </Modal>
  );
};

PartsRequestDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  requestData: PropTypes.object,
  onRefresh: PropTypes.func,
};

export default PartsRequestDetailModal;
