import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { DetailModalActions } from "../../../../components/molecules/DetailModalActions/DetailModalActions";
import { BaseWarrantyDetailSection } from "../../../scstaff/Warranty/components/BaseWarrantyDetailSection"; // Sử dụng lại base
import { Input } from "../../../../components/atoms/Input/Input";
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

  if (!warrantyData) return null;

  const rawPolicies =
    warrantyData.showPolicy ||
    warrantyData.raw?.showPolicy ||
    warrantyData.policies ||
    warrantyData.policyList ||
    [];
  const policies = Array.isArray(rawPolicies) ? rawPolicies : [rawPolicies];
  const handleApproveClick = () => {
    if (vehicleWarrantyId) {
      onApprove(warrantyData.claimId, vehicleWarrantyId);
    } else {
      toast.warning("Please select a warranty policy to approve.");
    }
  };

  // Xử lý khi nhấn nút Deny
  const handleDenyClick = () => {
    console.log("Warranty data", warrantyData);
    onDeny(warrantyData.claimId);
  };

  // Xử lý khi nhấn nút Need More Info
  const handleNeedMoreInfoClick = () => {
    if (!showReasonInput) {
      setShowReasonInput(true);
      return;
    }
    if (reason) {
      onNeedMoreInfo(warrantyData.claimId, reason);
    } else {
      toast.warning("Please provide a reason.");
    }
  };
  const handleClose = () => {
    setShowReasonInput(false);
    setReason("");
    setvehicleWarrantyId("");
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
                  {policy.policyName} (Expires: {policy.endDate})
                </option>
              ))}
            </select>
          </div>

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
              disabled={!vehicleWarrantyId}
              isLoading={isLoading}
            >
              Approve
            </Button>
          </DetailModalActions>
        </>
      )}

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
