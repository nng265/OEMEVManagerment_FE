import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import "./WarrantyClaimDetailModal.css";

export const PendingConfirmationModal = ({
  isOpen,
  onClose,
  warrantyData,
  onAction,
  technicians = [],
  onFetchTechnicians,
  isLoadingTechnicians = false,
}) => {
  const [showInputSection, setShowInputSection] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedDropdowns, setSelectedDropdowns] = useState([
    { id: 1, selectedValue: "" },
  ]);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectSection, setShowRejectSection] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [denialReasons, setDenialReasons] = useState([]);
  const [isLoadingDenialReasons, setIsLoadingDenialReasons] = useState(false);

  if (!warrantyData) return null;

  // ------------------- Request More Info Handlers -------------------
  const handleRequestMoreInfoClick = () => {
    // Ẩn Reject form nếu đang mở
    if (showRejectSection) {
      setShowRejectSection(false);
      setSelectedReason("");
      setReasonDetail("");
    }

    setShowInputSection(true);
    setDescription("");
    setSelectedDropdowns([{ id: 1, selectedValue: "" }]);
    onFetchTechnicians?.();
  };

  const handleSendRequest = () => {
    if (description.trim() === "") {
      alert("Please enter the reason for requesting more information.");
      return;
    }

    const techIdsToSend = selectedDropdowns
      .map((t) => t.selectedValue)
      .filter(Boolean);

    onAction?.("needMoreInfo", {
      description: description.trim(),
      ...(techIdsToSend.length > 0 && { assignsTo: techIdsToSend }),
    });
  };

  const handleCancelInput = () => {
    setShowInputSection(false);
    setDescription("");
    setSelectedDropdowns([{ id: 1, selectedValue: "" }]);
  };

  const handleAddTechnician = () => {
    const newId =
      (selectedDropdowns[selectedDropdowns.length - 1]?.id || 0) + 1;
    setSelectedDropdowns([
      ...selectedDropdowns,
      { id: newId, selectedValue: "" },
    ]);
  };

  const handleRemoveTechnician = (idToRemove) => {
    if (selectedDropdowns.length > 1)
      setSelectedDropdowns(selectedDropdowns.filter((t) => t.id !== idToRemove));
  };

  const handleTechSelectionChange = (rowId, selectedUserId) => {
    const updated = selectedDropdowns.map((t) =>
      t.id === rowId ? { ...t, selectedValue: selectedUserId } : t
    );
    setSelectedDropdowns(updated);
  };

  // ------------------- Reject Handlers -------------------
  const handleRejectClick = async () => {
    // Ẩn Request More Info nếu đang mở
    if (showInputSection) {
      setShowInputSection(false);
      setDescription("");
      setSelectedDropdowns([{ id: 1, selectedValue: "" }]);
    }

    // Nếu form chưa mở → mở form và load API
    if (!showRejectSection) {
      setShowRejectSection(true);
      setSelectedReason("");
      setReasonDetail("");
      setIsLoadingDenialReasons(true);

      try {
        const res = await request(ApiEnum.WARRANTY_DENIAL_REASONS);
        setDenialReasons(res?.data || []);
      } catch (err) {
        console.error("Failed to load denial reasons", err);
        alert("Failed to load denial reasons");
      } finally {
        setIsLoadingDenialReasons(false);
      }
      return;
    }

    // Nếu đã mở nhưng chưa chọn lý do
    if (!selectedReason) {
      alert("Please select a denial reason.");
      return;
    }

    // Nếu chọn Other nhưng chưa nhập lý do
    if (selectedReason === "Other" && reasonDetail.trim() === "") {
      alert("Please enter the reason detail.");
      return;
    }

    /// CALL API DENY
try {
  setIsRejecting(true);

  const payload = { reason: selectedReason };
  if (selectedReason === "Other") {
    payload.reasonDetail = reasonDetail.trim();
  }

  await request(
    {
      ...ApiEnum.DENY_WARRANTY_CLAIM,
      path: ApiEnum.DENY_WARRANTY_CLAIM.path.replace(":claimId", warrantyData.claimId)
    },
    payload
  );

  onAction?.("rejectSuccess");
  onClose(); // đóng popup

} catch (err) {
  console.error("Reject failed", err);
  alert("Failed to reject claim.");
} finally {
  setIsRejecting(false);
}

  };

  const handleCancelReject = () => {
    setShowRejectSection(false);
    setSelectedReason("");
    setReasonDetail("");
  };

  // ------------------- Approve Handler -------------------
  const handleApproveClick = () => onAction?.("sendToManufacturer");

  // ------------------- Request More Info Section -------------------
  const requestMoreInfoSection = showInputSection ? (
    <DetailSection title="Request More Information">
      <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div className="detail-item">
          <span className="label">Reason for Request:</span>
          <textarea
            className="form-textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed reason for requesting more information..."
            style={{ width: "100%", marginTop: "8px" }}
          />
        </div>

        <div
          className="detail-item"
          style={{ flexDirection: "column", alignItems: "stretch" }}
        >
          <span className="label">Assign Technician (Optional)</span>

          {isLoadingTechnicians ? (
            <p className="loading-text">Loading technician list...</p>
          ) : technicians.length > 0 ? (
            <div style={{ marginTop: "8px" }}>
              {selectedDropdowns.map((row) => {
                const selectedOtherIds = selectedDropdowns
                  .filter((r) => r.id !== row.id)
                  .map((r) => r.selectedValue)
                  .filter(Boolean);

                const filteredTechs = technicians.filter(
                  (t) => !selectedOtherIds.includes(t.userId)
                );

                return (
                  <div key={row.id} className="technician-row">
                    <select
                      className="form-select tech-select"
                      value={row.selectedValue}
                      onChange={(e) =>
                        handleTechSelectionChange(row.id, e.target.value)
                      }
                    >
                      <option value="">-- Select Technician --</option>
                      {filteredTechs.map((t) => (
                        <option key={t.userId} value={t.userId}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    {selectedDropdowns.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        onClick={() => handleRemoveTechnician(row.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={handleAddTechnician}
                style={{ marginTop: "0.5rem" }}
              >
                + Add Technician
              </Button>
            </div>
          ) : (
            <p className="no-technicians">No technicians available.</p>
          )}
        </div>

        <div style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div
            className="form-actions"
            style={{ marginTop: "12px", justifyContent: "space-between" }}
          >
            <Button variant="secondary" onClick={handleCancelInput}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendRequest}>
              Send Request
            </Button>
          </div>
        </div>
      </div>
    </DetailSection>
  ) : null;

  // ------------------- Reject Section -------------------
  const rejectSection = showRejectSection ? (
    <DetailSection title="Reject Claim">
      <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
        {/* DROPDOWN */}
        <div className="detail-item">
          <span className="label">Select Reason:</span>
          <select
            className="form-select"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            disabled={isLoadingDenialReasons}
            style={{ width: "100%", marginTop: "8px" }}
          >
            <option value="">
              {isLoadingDenialReasons ? "Loading..." : "-- Select Reason --"}
            </option>
            {denialReasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.description}
              </option>
            ))}
          </select>
        </div>

        {/* CUSTOM TEXTAREA - HIỂN THỊ KHI CHỌN OTHER */}
        {selectedReason === "Other" && (
          <div className="detail-item">
            <span className="label">Reason Detail:</span>
            <textarea
              className="form-textarea"
              rows={4}
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              placeholder="Enter reason detail for rejection..."
              style={{ width: "100%", marginTop: "8px" }}
            />
          </div>
        )}

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
          }}
        >
          <Button variant="secondary" onClick={handleCancelReject}>
            Cancel
          </Button>
            <Button
              variant="danger"
              onClick={handleRejectClick}
              disabled={isLoadingDenialReasons || isRejecting}
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
        </div>
      </div>
    </DetailSection>
  ) : null;

  // ------------------- Action Buttons -------------------
  const actionButtons = !showInputSection && !showRejectSection && (
    <>
      <Button variant="warning" onClick={handleRequestMoreInfoClick}>
        Request More Information
      </Button>
      <Button variant="danger" onClick={handleRejectClick}>
        Reject
      </Button>
      <Button variant="primary" onClick={handleApproveClick}>
        Approve
      </Button>
    </>
  );

  // ------------------- Return Modal -------------------
  return (
    <WarrantyClaimDetailModal
      isOpen={isOpen}
      onClose={onClose}
      warrantyData={warrantyData}
      additionalContent={
        <>
          {requestMoreInfoSection}
          {rejectSection}
        </>
      }
      showBackButton={!showInputSection && !showRejectSection}
      backButtonLabel="Cancel"
    >
      {actionButtons}
    </WarrantyClaimDetailModal>
  );
};

PendingConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  onAction: PropTypes.func.isRequired,
  technicians: PropTypes.array,
  onFetchTechnicians: PropTypes.func,
  isLoadingTechnicians: PropTypes.bool,
};

export default PendingConfirmationModal;
