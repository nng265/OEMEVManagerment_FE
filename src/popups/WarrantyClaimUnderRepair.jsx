import React from "react";
import "./WarrantyClaimPopup.css";
import InspectionDetail from "../components/InspectionDetail";
import PartsToReplaceRepair from "../components/PartsToReplaceRepair";
import CustomerVehicleInfo from "../components/CustomerVehicleInfo";
import WarrantyRecords from "../components/WarrantyRecords";
import IssueDescription from "../components/IssueDescription";

export default function WarrantyClaimUnderRepair({
  vehicle,
  warrantyRecords,
  issueDescription,
  inspectionDetail,
  parts,
  technicians,
  onBack,
  onClose,
}) {
  return (
    <div className="warranty-popup">
      {/* --- Header --- */}
      <div className="popup-header">
        <h3>Warranty Claim</h3>
        <span className="status-badge under-repair">Under Repair</span>
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

      {/* --- Inspection Detail --- */}
      <div className="section">
        <InspectionDetail
          detail={inspectionDetail?.description}
          images={inspectionDetail?.images}
        />
      </div>

      {/* --- Parts --- */}
      <div className="section">
        <h4>Parts to Replace/Repair</h4>
        <PartsToReplaceRepair parts={parts} />
      </div>

      {/* --- Technicians --- */}
      {technicians?.length > 0 && (
        <div className="section">
          <h4>Technician Repair</h4>
          <ul className="technician-list">
            {technicians.map((t) => (
              <li key={t.id} className="technician-item">
                {t.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Footer --- */}
      <div className="popup-footer">
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
