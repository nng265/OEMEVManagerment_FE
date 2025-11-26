import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { DetailModalActions } from "../../../../components/molecules/DetailModalActions/DetailModalActions";
import { BaseWarrantyDetailSection } from "../../../scstaff/Warranty/components/BaseWarrantyDetailSection";
import { Input } from "../../../../components/atoms/Input/Input";
import ConfirmDialog from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";
export const EVMStaffConfirmationModal = ({
  isOpen,
  onClose,
  warrantyData,
  onApprove,
  onDeny,
  onNeedMoreInfo,
  isLoading,
}) => {
  const [vehicleWarrantyId, setvehicleWarrantyId] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");
  const [denyReason, setDenyReason] = useState("");
  const [showDenyReasonInput, setShowDenyReasonInput] = useState(false);
  const [denialReasons, setDenialReasons] = useState([]);
  const [isLoadingDenialReasons, setIsLoadingDenialReasons] = useState(false);
  const [showConfirmDeny, setShowConfirmDeny] = useState(false);
  const [showConfirmNeedMoreInfo, setShowConfirmNeedMoreInfo] = useState(false);
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [isDenyProcessing, setIsDenyProcessing] = useState(false);
  const [isApproveProcessing, setIsApproveProcessing] = useState(false);
  const [showApproveSelect, setShowApproveSelect] = useState(false);
  const [selectedDenyReason, setSelectedDenyReason] = useState("");
  const [denyReasonDetail, setDenyReasonDetail] = useState("");

  if (!warrantyData) return null;
  const formatDateOnly = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; 
  };
  const rawPolicies =
    warrantyData.showPolicy ||
    warrantyData.raw?.showPolicy ||
    warrantyData.policies ||
    warrantyData.policyList ||
    [];
  const policies = Array.isArray(rawPolicies) ? rawPolicies : [rawPolicies];
  const handleApproveClick = () => {
    // If approve select is not shown yet, open it (and hide other forms)
    if (!showApproveSelect) {
      if (showReasonInput) {
        setShowReasonInput(false);
        setReason("");
      }
      if (showDenyReasonInput) {
        setShowDenyReasonInput(false);
        setSelectedDenyReason("");
        setDenyReasonDetail("");
      }
      setShowApproveSelect(true);
      return;
    }

    // If select is already shown, validate selection then open confirm
    if (vehicleWarrantyId) {
      setShowConfirmApprove(true);
    } else {
      toast.warning("Please select a warranty policy to approve.");
    }
  };

  const confirmApprove = async () => {
    setIsApproveProcessing(true);
    try {
      await onApprove(warrantyData.claimId, vehicleWarrantyId);
      setShowConfirmApprove(false);
      setvehicleWarrantyId("");
      setShowApproveSelect(false);
      // Container's onApprove will close modal by clearing selected claim and show toast
    } catch (err) {
      console.error("Approve failed", err);
      setShowConfirmApprove(false);
      toast.error(err?.message || "Failed to approve claim.");
    } finally {
      setIsApproveProcessing(false);
    }
  };

  // Xử lý khi nhấn nút Deny
  const handleDenyClick = async () => {
    // Tắt ô Need more info nếu đang mở
    if (showReasonInput) {
      setShowReasonInput(false);
      setReason("");
    }

    // Nếu form chưa mở → mở form và load API denial reasons
    if (!showDenyReasonInput) {
      setShowDenyReasonInput(true);
      setSelectedDenyReason("");
      setDenyReasonDetail("");
      setIsLoadingDenialReasons(true);

      try {
        const res = await request(ApiEnum.WARRANTY_DENIAL_REASONS);
        setDenialReasons(res?.data || []);
      } catch (err) {
        console.error("Failed to load denial reasons", err);
        toast.error("Failed to load denial reasons");
      } finally {
        setIsLoadingDenialReasons(false);
      }
      return;
    }

    // Nếu đã mở nhưng chưa chọn lý do
    if (!selectedDenyReason) {
      toast.warning("Please select a denial reason.");
      return;
    }

    // Nếu chọn Other nhưng chưa nhập lý do
    if (selectedDenyReason === "Other" && denyReasonDetail.trim() === "") {
      toast.warning("Please enter the reason detail.");
      return;
    }

    // Show confirmation dialog
    setShowConfirmDeny(true);
  };

  // Confirm deny action
  const confirmDeny = async () => {
    setIsDenyProcessing(true);
    try {
      const payload = {
        params: { claimId: warrantyData.claimId },
        reason: selectedDenyReason,
      };
      if (selectedDenyReason === "Other") {
        payload.reasonDetail = denyReasonDetail.trim();
      }
      await onDeny(payload);
      setShowConfirmDeny(false);
      setShowDenyReasonInput(false);
      setSelectedDenyReason("");
      setDenyReasonDetail("");
      toast.success("Claim denied successfully!");
    } catch (err) {
      console.error("Deny failed", err);
      setShowConfirmDeny(false);
      toast.error(err?.message || "Failed to deny claim.");
    } finally {
      setIsDenyProcessing(false);
    }
  };

  // Xử lý khi nhấn nút Need More Info
  const handleNeedMoreInfoClick = () => {
    // Tắt ô Deny nếu đang mở
    if (showDenyReasonInput) {
      setShowDenyReasonInput(false);
      setSelectedDenyReason("");
      setDenyReasonDetail("");
    }
    // Nếu ô Need more info chưa mở → mở nó
    if (!showReasonInput) {
      setShowReasonInput(true);
      return;
    }
    // Nếu ô Need more info đã mở → validate and show confirm
    if (!reason.trim()) {
      toast.warning("Please provide a reason.");
      return;
    }
    setShowConfirmNeedMoreInfo(true);
  };

  // Confirm need more info action
  const confirmNeedMoreInfo = async () => {
    setIsDenyProcessing(true);
    try {
      await onNeedMoreInfo(warrantyData.claimId, reason);
      setShowConfirmNeedMoreInfo(false);
      setShowReasonInput(false);
      setReason("");
      toast.success("Need more info request sent successfully!");
    } catch (err) {
      console.error("Need more info failed", err);
      setShowConfirmNeedMoreInfo(false);
      toast.error(err?.message || "Failed to send need more info request.");
    } finally {
      setIsDenyProcessing(false);
    }
  };

  const handleClose = () => {
    setShowReasonInput(false);
    setReason("");
    setShowDenyReasonInput(false);
    setSelectedDenyReason("");
    setDenyReasonDetail("");
    setShowConfirmDeny(false);
    setShowConfirmNeedMoreInfo(false);
    setvehicleWarrantyId("");
    setShowApproveSelect(false);
    setShowConfirmApprove(false);
    setIsDenyProcessing(false);
    onClose();
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Warranty Claim Confirmation"
      size="lg"
      showFooter={false} 
    >
      {/* 1. Hiển thị thông tin cơ bản (từ BaseWarrantyDetailSection) */}
      <BaseWarrantyDetailSection warrantyData={warrantyData} />


      {/* 2 & 4. Chỉ hiện Dropdown chọn Policy và các nút Actions khi status là sent to manufacturer */}
      {warrantyData.status === "sent to manufacturer" && (
        <>
          {showApproveSelect && (
            <div
              className="detail-section"
              style={{
                borderTop: "2px solid #edf2f7",
                marginTop: "20px",
                paddingTop: "20px",
              }}
            >
              <h4 className="detail-section-title">Warranty Record Approve *</h4>
              <select
                className="form-input"
                value={vehicleWarrantyId}
                onChange={(e) => setvehicleWarrantyId(e.target.value)}
              >
                <option value="" disabled>
                  -- Select a policy to apply --
                </option>
                {policies.map((policy) => (
                  <option
                    key={policy.vehicleWarrantyId || policy.policyName}
                    value={policy.vehicleWarrantyId}
                  >
                    {policy.policyName} (Expires: {formatDateOnly(policy.startDate)} To {formatDateOnly(policy.endDate)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Phần nhập lý do cho "Need more info" (chỉ hiện khi nhấn nút) */}
          {showReasonInput && (
            <div className="detail-section" style={{ paddingTop: "10px" }}>
              <h4 className="detail-section-title">Reason for "Need more info"</h4>
              <Input
                type="textarea"
                name="reason"
                placeholder="Enter reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth={true}
              />
            </div>
          )}
          {/* Deny reason dropdown and detail */}
          {showDenyReasonInput && (
            <div className="detail-section" style={{ paddingTop: "10px" }}>
              <h4 className="detail-section-title">Select Denial Reason</h4>
              <select
                className="form-select"
                value={selectedDenyReason}
                onChange={(e) => setSelectedDenyReason(e.target.value)}
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
              
              {/* Detail textarea for Other reason */}
              {selectedDenyReason === "Other" && (
                <div style={{ marginTop: "12px" }}>
                  <h4 className="detail-section-title">Reason Detail</h4>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={denyReasonDetail}
                    onChange={(e) => setDenyReasonDetail(e.target.value)}
                    placeholder="Enter reason detail for denial..."
                    style={{ width: "100%" }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Các nút Actions */}
          <DetailModalActions onBack={handleClose} backLabel="Back">
            <Button
              variant="warning"
              onClick={handleNeedMoreInfoClick}
              isLoading={isLoading}
            >
              {showReasonInput ? "Submit Reason" : "Need more info"}
            </Button>

            <Button
              variant="danger"
              onClick={handleDenyClick}
              isLoading={isLoading}
            >
              Deny
            </Button>

            <Button
              variant="success"
              onClick={handleApproveClick}
              disabled={showApproveSelect ? !vehicleWarrantyId : false}
              isLoading={isLoading}
            >
              Approve
            </Button>
          </DetailModalActions>
        </>
      )}

      {/* Confirm dialog for Deny */}
      <ConfirmDialog
        isOpen={showConfirmDeny}
        title="Confirm Deny"
        message={`Are you sure you want to deny this claim? Reason: ${selectedDenyReason}${
          selectedDenyReason === "Other" && denyReasonDetail
            ? ` - ${denyReasonDetail}`
            : ""
        }`}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={confirmDeny}
        onCancel={() => setShowConfirmDeny(false)}
        isLoading={isDenyProcessing}
      />

      {/* Confirm dialog for Approve */}
      <ConfirmDialog
        isOpen={showConfirmApprove}
        title="Confirm Approve"
        message={`Are you sure you want to approve this claim with policy: ${policies.find(p => p.vehicleWarrantyId === vehicleWarrantyId)?.policyName || ''}`}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={confirmApprove}
        onCancel={() => setShowConfirmApprove(false)}
        isLoading={isApproveProcessing}
      />

      {/* Confirm dialog for Need More Info */}
      <ConfirmDialog
        isOpen={showConfirmNeedMoreInfo}
        title="Confirm Need More Info"
        message={`Send need more info request? Reason: ${reason}`}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={confirmNeedMoreInfo}
        onCancel={() => setShowConfirmNeedMoreInfo(false)}
        isLoading={isDenyProcessing}
      />

    </Modal>
  );
};

EVMStaffConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  onApprove: PropTypes.func.isRequired,
  onDeny: PropTypes.func.isRequired,
  onNeedMoreInfo: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
