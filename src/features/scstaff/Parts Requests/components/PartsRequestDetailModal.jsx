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
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [incidentItems, setIncidentItems] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [serialMap, setSerialMap] = useState({});
  const fileInputRef = useRef(null);

  // Action State
  const [showActionModal, setShowActionModal] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [actionReasonDetail, setActionReasonDetail] = useState("");
  const [actionNote, setActionNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setValidationResult(null);
      setSelectedFile(null);
      setIncidentItems([]);
      setSerialMap({});
      setShowActionModal(null);
      setActionReason("");
      setActionReasonDetail("");
      setActionNote("");
    }
  }, [isOpen, requestData]);

  if (!requestData) return null;
  const { requestID, status, partOrderItems = [], timeline = [] } = requestData;
  const currentStatus = (status || "").trim();

  // API Helpers
  const fetchSerials = async (modelName) => {
    if (!modelName || serialMap[modelName]) return;
    try {
      const url = ApiEnum.GET_SHIPMENT_SERIALS(requestID);
      const response = await request(url, { model: modelName }, "GET");
      if (response.success) {
        setSerialMap((prev) => ({ ...prev, [modelName]: response.data || [] }));
      } else {
        setSerialMap((prev) => ({ ...prev, [modelName]: [] }));
      }
    } catch (error) {
      setSerialMap((prev) => ({ ...prev, [modelName]: [] }));
    }
  };

  const getSerialOptions = (modelName) => serialMap[modelName];

  // Handlers
  const handleIncidentChange = (index, field, value) => {
    const newItems = [...incidentItems];
    newItems[index][field] = value;
    if (field === "partModel") {
      newItems[index].serial = "";
      if (value) fetchSerials(value);
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
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  // API Actions
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

  const handleValidateReceipt = async () => {
    if (!selectedFile) return toast.warning("Please select an Excel file");
    setIsLoading(true);
    try {
      const payload = { params: { orderId: requestID }, file: selectedFile };
      const response = await uploadFiles(ApiEnum.VALIDATE_RECEIPT, payload);
      if (response.success) {
        setValidationResult(response.data);
        if (response.data.isValid) toast.success("File is valid!");
        else toast.error("Validation failed.");
      } else toast.error(response.message);
    } catch {
      toast.error("Error validating file");
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

  // Renderers
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
    const { isValid, errors, serialMismatches } = validationResult;
    if (isValid)
      return (
        <div className="validation-success">
          ✅ File Valid! Proceed to next step.
        </div>
      );
    return (
      <div className="validation-result-container">
        <div className="validation-error">⚠️ Validation Errors:</div>
        {errors?.map((e, i) => (
          <li key={i} className="error-list">
            {e}
          </li>
        ))}
        {serialMismatches?.map((m, i) => (
          <li key={i} className="error-list">
            {m.model}: {m.message}
          </li>
        ))}
      </div>
    );
  };

  const renderReceiptProcess = () => {
    if (currentStatus !== "Delivered" && currentStatus !== "In Transit")
      return null;

    return (
      <div className="inventory-section">
        <div className="receipt-steps">
          <span
            className={`step-item ${
              currentStep === 1 ? "active" : "completed"
            }`}
          >
            1. Validate Receipt
          </span>
          <span className={`step-item ${currentStep === 2 ? "active" : ""}`}>
            2. Report Damage & Confirm
          </span>
        </div>

        {currentStep === 1 && (
          <>
            <div className="import-excel-btn-wrapper">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden-file-input"
                id="receipt-file"
              />
              <label htmlFor="receipt-file" className="btn-import-excel">
                {selectedFile
                  ? `📄 ${selectedFile.name}`
                  : "📤 Upload Receipt Excel"}
              </label>
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "0.8rem",
                  color: "#64748b",
                  fontStyle: "italic",
                }}
              >
                *Maximum 20 items per file
              </p>
            </div>
            <div
              className="mt-3 text-center"
              style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            >
              <Button
                variant="primary"
                onClick={handleValidateReceipt}
                isLoading={isLoading}
                disabled={!selectedFile}
              >
                Validate File
              </Button>
              <Button variant="light" onClick={() => setCurrentStep(2)}>
                Skip ➡️
              </Button>
            </div>
            {renderValidationResult()}
            {validationResult?.isValid && (
              <div className="mt-3 text-end">
                <Button variant="success" onClick={() => setCurrentStep(2)}>
                  Next Step ➡️
                </Button>
              </div>
            )}
          </>
        )}

        {currentStep === 2 && (
          <div className="incident-report-container">
            <h4
              style={{
                margin: "0 0 16px 0",
                fontSize: "1rem",
                color: "#334155",
              }}
            >
              Report Damaged Items
            </h4>
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
                      {partOrderItems.map((p) => (
                        <option key={p.model} value={p.model}>
                          {p.model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 3 }}>
                    <label>Serial</label>
                    {/* Dropdown Serial */}
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
                        <option disabled>No serials (Empty)</option>
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
                  >
                    🗑️
                  </button>
                </div>
              );
            })}

            <div className="d-flex gap-2 mb-3">
              <Button variant="light" size="sm" onClick={addIncidentRow}>
                ➕ Add Item
              </Button>
            </div>
            <div className="d-flex justify-content-between pt-3 border-top">
              <Button variant="light" onClick={() => setCurrentStep(1)}>
                ⬅️ Back
              </Button>
              <Button
                variant="success"
                onClick={handleConfirmReceipt}
                isLoading={isLoading}
              >
                ✅ Confirm Receipt
              </Button>
            </div>
          </div>
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
          </tr>
        </thead>
        <tbody>
          {partOrderItems.map((p, i) => (
            <tr key={i}>
              <td>{p.model}</td>
              <td>{p.requestedQuantity}</td>
              <td>{p.scStock ?? "-"}</td>
            </tr>
          ))}
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

      {/* 1. TIMELINE */}
      <DetailSection title="Timeline">{renderTimeline()}</DetailSection>

      {/* 2. PROCESS FORM */}
      {renderReceiptProcess()}

      <DetailModalActions onBack={onClose} backLabel="Close">
        {currentStatus === "In Transit" && (
          <div style={{ marginRight: "auto" }}>
            <Button
              variant="primary"
              onClick={handleAcknowledgeReceipt}
              isLoading={isLoading}
            >
              📦 Acknowledge Receipt
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
