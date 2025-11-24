import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { DetailModalActions } from "../../../../components/molecules/DetailModalActions/DetailModalActions";
import { Button } from "../../../../components/atoms/Button/Button";
import { formatDate } from "../../../../services/helpers";
import { toast } from "react-toastify";
import "./PartsRequest.css";

export const PartsRequestDetailModal = ({
  isOpen,
  onClose,
  requestData,
  onConfirmDelivered,
  isConfirming = false,
}) => {
  // === STATE QUẢN LÝ BÁO HƯ HỎNG ===
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);

  // Thêm trường 'image' vào state mặc định
  const [incidentItems, setIncidentItems] = useState([
    { partModel: "", serial: "", image: null },
  ]);

  // === STATE QUẢN LÝ KIỂM KÊ (IMPORT EXCEL) ===
  const [selectedFile, setSelectedFile] = useState(null);
  const [importAlert, setImportAlert] = useState(null);
  const fileInputRef = useRef(null);

  if (!requestData) return null;

  const {
    requestID,
    status,
    partOrderItems = [],
    timeline = [],
    expectedDate,
  } = requestData;

  const currentStatus = (status || "").trim().toLowerCase();
  const isDelivered =
    currentStatus === "delivered" || currentStatus === "deliverd";

  // --- LOGIC: IMPORT EXCEL ---
  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setImportAlert(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImportAlert(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- LOGIC: BÁO HƯ HỎNG ---
  const toggleIncidentForm = () => {
    setShowIncidentForm(!showIncidentForm);
    if (showIncidentForm) {
      setShowResultPopup(false);
    }
  };

  const handleIncidentChange = (index, field, value) => {
    const newItems = [...incidentItems];
    newItems[index][field] = value;
    setIncidentItems(newItems);
  };

  // === MỚI: HÀM XỬ LÝ UPLOAD ẢNH CHO TỪNG DÒNG ===
  const handleIncidentImageUpload = (index, file) => {
    if (!file) return;
    const newItems = [...incidentItems];
    // Lưu object File vào state để sau này gửi lên server
    newItems[index].image = file;
    // Tạo URL preview để hiển thị ngay
    newItems[index].previewUrl = URL.createObjectURL(file);
    setIncidentItems(newItems);
  };

  const removeIncidentImage = (index) => {
    const newItems = [...incidentItems];
    newItems[index].image = null;
    newItems[index].previewUrl = null;
    setIncidentItems(newItems);
  };

  const addIncidentRow = () => {
    setIncidentItems([
      ...incidentItems,
      { partModel: "", serial: "", image: null },
    ]);
  };

  const removeIncidentRow = (index) => {
    const newItems = incidentItems.filter((_, i) => i !== index);
    setIncidentItems(newItems);
  };

  // === LOGIC: VALIDATION & POPUP ===
  const handleOpenResultPopup = () => {
    // Lọc bỏ các dòng rỗng
    const validItems = incidentItems.filter(
      (item) =>
        item.partModel &&
        item.partModel !== "" &&
        item.serial &&
        item.serial.trim() !== ""
    );

    if (validItems.length === 0) {
      toast.warning("Please enter damage details or remove empty rows.");
      return;
    }

    setIncidentItems(validItems);
    setShowResultPopup(true);
  };

  const handleSendToEVM = () => {
    // NOTE: Khi gửi ảnh lên server, bạn thường cần dùng FormData
    // Ví dụ:
    // const formData = new FormData();
    // formData.append('orderId', requestID);
    // incidentItems.forEach((item, index) => {
    //    formData.append(`items[${index}].model`, item.partModel);
    //    formData.append(`items[${index}].serial`, item.serial);
    //    if (item.image) formData.append(`items[${index}].image`, item.image);
    // });

    console.log("Sending clean data to EVM Staff:", incidentItems);
    toast.success("Report sent to EVM Staff successfully!");

    setShowResultPopup(false);
    setShowIncidentForm(false);
    // Reset form
    setIncidentItems([{ partModel: "", serial: "", image: null }]);
  };

  // --- RENDER HELPERS ---
  const renderInventorySection = () => {
    if (!isDelivered) return null;
    return (
      <div className="inventory-section" style={{ marginTop: "16px" }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden-file-input"
        />
        {!selectedFile ? (
          <div className="import-excel-btn-wrapper">
            <button className="btn-import-excel" onClick={handleImportClick}>
              <span>📤 Import Excel File</span>
            </button>
            <p className="upload-hint">
              Upload Excel file with standard format to import serial numbers in
              bulk
            </p>
          </div>
        ) : (
          <div className="selected-file-preview">
            <div className="file-info">
              <span style={{ fontSize: "1.2rem" }}>📊</span>
              <span>{selectedFile.name}</span>
            </div>
            <button className="btn-remove-file" onClick={handleRemoveFile}>
              ✖
            </button>
          </div>
        )}
        {importAlert && <div className="inventory-alert">⚠️ {importAlert}</div>}
      </div>
    );
  };

  const renderResultPopup = () => {
    if (!showResultPopup) return null;
    return (
      <div className="popup-overlay">
        <div className="popup-container">
          <div className="popup-header">
            <h3>Confirm Report</h3>
          </div>
          <div className="popup-body">
            <p style={{ marginBottom: "10px", fontSize: "0.9rem" }}>
              The following items will be reported as damaged/discrepancy:
            </p>
            {incidentItems.map((item, idx) => (
              // Sửa lại hiển thị trong Popup để hiện cả ảnh
              <div key={idx} className="popup-item-row">
                {/* Hiển thị ảnh nếu có */}
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt="Damaged"
                    className="popup-item-image"
                  />
                ) : (
                  <div
                    className="popup-item-image"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f1f5f9",
                      color: "#cbd5e1",
                    }}
                  >
                    No Img
                  </div>
                )}

                <div
                  className="damaged-item-preview"
                  style={{
                    flex: 1,
                    border: "none",
                    margin: 0,
                    padding: 0,
                    background: "transparent",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="item-model">{item.partModel}</span>
                    <small style={{ color: "#94a3b8" }}>Model</small>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <span className="item-serial">{item.serial}</span>
                    <small style={{ color: "#94a3b8" }}>Serial Number</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="popup-footer">
            <Button variant="light" onClick={() => setShowResultPopup(false)}>
              Back to Edit
            </Button>
            <Button variant="danger" onClick={handleSendToEVM}>
              Confirm & Send
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeline = () => (
    <div className="timeline-wrapper">
      <div className="timeline-container">
        {timeline.map((item, index) => (
          <div className="timeline-item" key={index}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-title">{item.status || "Event"}</div>
              <div className="timeline-date">
                {formatDate(item.date, "en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
              {item.notes && <p className="timeline-notes">{item.notes}</p>}
            </div>
          </div>
        ))}
        {timeline.length === 0 && <p className="timeline-empty">No events.</p>}
      </div>

      {isDelivered && (
        <div className="incident-report-container">
          {!showIncidentForm ? (
            <button
              className="btn-report-incident"
              onClick={toggleIncidentForm}
            >
              <span>✖ Report Damage</span>
            </button>
          ) : (
            <div className="incident-form">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <h4 style={{ margin: 0, fontSize: "1rem", color: "#334155" }}>
                  Report Damage / Discrepancy
                </h4>
                <button
                  onClick={toggleIncidentForm}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* === LOOP INPUT ITEMS === */}
              {incidentItems.map((item, index) => (
                <div className="incident-row" key={index}>
                  {/* Cột 1: Model */}
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Part Model</label>
                    <select
                      className="form-select"
                      value={item.partModel}
                      onChange={(e) =>
                        handleIncidentChange(index, "partModel", e.target.value)
                      }
                    >
                      <option value="">Select Part...</option>
                      {partOrderItems.map((part) => (
                        <option key={part.id || part.model} value={part.model}>
                          {part.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cột 2: Serial */}
                  <div className="form-group" style={{ flex: 3 }}>
                    <label>Enter Serial</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.serial}
                      onChange={(e) =>
                        handleIncidentChange(index, "serial", e.target.value)
                      }
                    />
                  </div>

                  {/* Cột 3: Image Upload (MỚI) */}
                  <div className="form-group incident-image-group">
                    <label style={{ width: "100%", textAlign: "center" }}>
                      Img
                    </label>
                    <div
                      className="image-upload-box"
                      onClick={() =>
                        document.getElementById(`incident-img-${index}`).click()
                      }
                    >
                      {/* Input ẩn */}
                      <input
                        type="file"
                        id={`incident-img-${index}`}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) =>
                          handleIncidentImageUpload(index, e.target.files[0])
                        }
                      />

                      {/* Nếu có ảnh thì hiện Preview, không thì hiện icon Upload */}
                      {item.previewUrl ? (
                        <>
                          <img
                            src={item.previewUrl}
                            alt="Preview"
                            className="preview-image-mini"
                          />
                          <div
                            className="remove-image-btn"
                            onClick={(e) => {
                              e.stopPropagation(); // Chặn click lan ra ngoài
                              removeIncidentImage(index);
                            }}
                          >
                            Trash
                          </div>
                        </>
                      ) : (
                        <span className="upload-icon">📷</span>
                      )}
                    </div>
                  </div>

                  {/* Nút xóa dòng */}
                  {incidentItems.length > 1 && (
                    <button
                      className="btn-remove-row"
                      onClick={() => removeIncidentRow(index)}
                      style={{ marginBottom: "2px" }} // Căn chỉnh chút cho đẹp
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}

              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn-add-row" onClick={addIncidentRow}>
                  ➕
                </button>
              </div>
              <div className="incident-actions">
                <Button
                  variant="light"
                  onClick={toggleIncidentForm}
                  style={{ marginRight: "8px" }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleOpenResultPopup}>
                  Inventory results report
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPartsTable = () => (
    <div className="table-responsive">
      <table className="parts-request-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Part Model</th>
            <th>Part Name</th>
            <th>Requested Qty</th>
            <th>SC Stock</th>
          </tr>
        </thead>
        <tbody>
          {partOrderItems.map((part, index) => (
            <tr key={part.orderItemId || index}>
              <td>
                <div className="part-img-wrapper">
                  <img
                    src={
                      part.image ||
                      "https://via.placeholder.com/100?text=No+Img"
                    }
                    alt={part.partName}
                    className="part-img-thumbnail"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/100?text=Error";
                    }}
                  />
                </div>
              </td>
              <td>{part.model || "N/A"}</td>
              <td>{part.partName || "Part Name Placeholder"}</td>
              <td>{part.requestedQuantity ?? 0}</td>
              <td
                style={{
                  color:
                    part.scStock < part.requestedQuantity ? "red" : "inherit",
                }}
              >
                {part.scStock ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  let modalTitle = status || "Request Details";
  if (isDelivered) modalTitle = "Delivered";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        size="lg"
        showFooter={false}
      >
        <DetailSection title="Requested Parts">
          {renderPartsTable()}
        </DetailSection>

        {renderInventorySection()}

        {currentStatus === "waiting" && (
          <DetailSection title="Delivery Information">
            <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="detail-item">
                <span className="label">Expected Delivery Date:</span>
                <span
                  className="value"
                  style={{ color: "var(--bs-primary)", fontWeight: "600" }}
                >
                  {expectedDate
                    ? formatDate(expectedDate, "vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Not specified"}
                </span>
              </div>
            </div>
          </DetailSection>
        )}

        <DetailSection title="Timeline">{renderTimeline()}</DetailSection>

        {!showIncidentForm && (
          <DetailModalActions onBack={onClose} backLabel="Close">
            {isDelivered && (
              <Button
                variant="success"
                onClick={() => onConfirmDelivered(requestID)}
                isLoading={isConfirming}
              >
                Confirm Delivered
              </Button>
            )}
          </DetailModalActions>
        )}
      </Modal>

      {renderResultPopup()}
    </>
  );
};

PartsRequestDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  requestData: PropTypes.object,
  onConfirmDelivered: PropTypes.func.isRequired,
  isConfirming: PropTypes.bool,
};

export default PartsRequestDetailModal;
