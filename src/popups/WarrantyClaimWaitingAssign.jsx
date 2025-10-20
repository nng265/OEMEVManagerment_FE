import React, { useState } from "react";
import "./WarrantyClaimPopup.css";
import InspectionDetail from "../components/InspectionDetail";
import PartsToReplaceRepair from "../components/PartsToReplaceRepair";
import CustomerVehicleInfo from "../components/CustomerVehicleInfo";
import WarrantyRecords from "../components/WarrantyRecords";
import IssueDescription from "../components/IssueDescription";

export default function WarrantyClaimWaitingAssign({
  vehicle,
  warrantyRecords,
  issueDescription,
  inspectionDetail,
  parts,
  onAssign,
  onBack,
  onClose,
}) {
  // Danh sách tất cả kỹ thuật viên có thể chọn
  const availableTechs = ["Nguyen B", "Tran C", "Le D", "Pham E"];

  // Các dòng kỹ thuật viên đã chọn (mặc định 1 dòng trống)
  const [assignedTechs, setAssignedTechs] = useState([""]);

  // Thêm dòng mới
  const handleAddTechnician = () => {
    setAssignedTechs([...assignedTechs, ""]);
  };

  // Cập nhật khi người dùng chọn tên kỹ thuật viên
  const handleSelectChange = (index, value) => {
    const updated = [...assignedTechs];
    updated[index] = value;
    setAssignedTechs(updated);
  };

  // Xóa dòng kỹ thuật viên
  const handleRemoveTechnician = (index) => {
    setAssignedTechs(assignedTechs.filter((_, i) => i !== index));
  };

  return (
    <div className="warranty-popup">
      <div className="popup-header">
        <h3>Warranty Claim</h3>
        <span className="status-badge waiting">Waiting for Assignment</span>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      {/* --- Customer + Vehicle Info --- */}
      <div className="info-section">
        <CustomerVehicleInfo vin={vehicle?.vin} />
      </div>
      {/* --- Warranty Record --- */}
      <div className="section">
        <WarrantyRecords records={warrantyRecords} />
      </div>
      {/* --- Issue Description --- */}
      <div className="section">
        <IssueDescription description={issueDescription} />
      </div>

      {/* --- Chi tiết kiểm tra --- */}
      <div className="section">
        <InspectionDetail
          detail={inspectionDetail?.description}
          images={inspectionDetail?.images}
        />
      </div>

      {/* --- Linh kiện --- */}
      <div className="section">
        <h4>Parts to Replace/Repair</h4>
        <PartsToReplaceRepair parts={parts} />
      </div>

      {/* --- Chọn kỹ thuật viên --- */}
      <div className="section">
        <h4>Select Technician *</h4>
        <div className="technician-select">
          {assignedTechs.map((tech, index) => (
            <div className="technician-select-row" key={index}>
              <select
                value={tech}
                onChange={(e) => handleSelectChange(index, e.target.value)}
              >
                <option value="">Select a technician</option>
                {availableTechs.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                className="remove-tech-btn"
                onClick={() => handleRemoveTechnician(index)}
              >
                ✕
              </button>
            </div>
          ))}

          <button className="add-tech-btn" onClick={handleAddTechnician}>
            + Add more technician
          </button>
        </div>
      </div>

      {/* --- Footer --- */}
      <div className="popup-footer">
        <button onClick={onBack}>Back</button>
        <button className="primary-btn" onClick={onAssign}>
          Assignment
        </button>
      </div>
    </div>
  );
}
