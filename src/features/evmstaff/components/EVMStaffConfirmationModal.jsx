import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../components/molecules/Modal/Modal";
import { Button } from "../../../components/atoms/Button/Button";
import { DetailModalActions } from "../../../components/molecules/DetailModalActions/DetailModalActions";
import BaseWarrantyDetailSection from "../../warranty/components/BaseWarrantyDetailSection";
import { Input } from "../../../components/atoms/Input/Input";

export const EVMStaffConfirmationModal = ({
  isOpen,
  onClose,
  warrantyData,
  onApprove,
  onDeny,
  onNeedMoreInfo,

  isActionLoading,
}) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");

  // Lấy claimId từ warrantyData
  const claimId = warrantyData?.claimId || warrantyData?.id;

  // Lấy policies từ warrantyData.showPolicy (dữ liệu chi tiết claim)

  const rawPolicies =
    warrantyData?.showPolicy ||
    warrantyData?.raw?.showPolicy ||
    warrantyData?.policies ||
    warrantyData?.policyList ||
    [];
  const policies = Array.isArray(rawPolicies)
    ? rawPolicies
    : rawPolicies
    ? [rawPolicies]
    : [];

  useEffect(() => {
    if (isOpen && warrantyData) {
      setSelectedPolicyId("");
      setShowReasonInput(false);
      setReason("");
    }
  }, [isOpen, warrantyData]);

  const handleApproveClick = () => {
    if (selectedPolicyId) {
      onApprove(claimId, selectedPolicyId);
    } else {
      alert("Please select a warranty policy to approve.");
    }
  };
  const handleDenyClick = () => {
    onDeny(claimId);
  };
  const handleNeedMoreInfoClick = () => {
    if (!showReasonInput) {
      setShowReasonInput(true);
      return;
    }
    if (reason) {
      onNeedMoreInfo(claimId, reason);
    } else {
      alert("Please provide a reason.");
    }
  };
  const handleClose = () => {
    onClose();
  };

  // Hàm render nội dung chính của Modal
  const renderContent = () => {
    if (!warrantyData) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          Claim data is not available.
        </div>
      );
    }

    return (
      <>
        <BaseWarrantyDetailSection warrantyData={warrantyData} />

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
            value={selectedPolicyId}
            onChange={(e) => setSelectedPolicyId(e.target.value)}
            // Vô hiệu hóa nếu không có policies nào trong showPolicy
            disabled={policies.length === 0}
          >
            <option value="" disabled>
              {policies.length === 0
                ? "-- No applicable policies found --"
                : "-- Select a policy to apply --"}
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

        {showReasonInput && (
          <div className="detail-section" style={{ paddingTop: "10px" }}>
            <h4 className="detail-section-title">
              Reason for "Need more info"
            </h4>
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

        <DetailModalActions onBack={handleClose} backLabel="Back">
          <Button
            variant="warning"
            onClick={handleNeedMoreInfoClick}
            isLoading={isActionLoading}
          >
            {showReasonInput ? "Submit Reason" : "Need more info"}
          </Button>
          <Button
            variant="danger"
            onClick={handleDenyClick}
            isLoading={isActionLoading}
          >
            Deny
          </Button>
          <Button
            variant="success"
            onClick={handleApproveClick}
            disabled={!selectedPolicyId}
            isLoading={isActionLoading}
          >
            Approve
          </Button>
        </DetailModalActions>
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Warranty Claim Confirmation"
      size="lg"
      showFooter={false}
    >
      {renderContent()}
    </Modal>
  );
};

// PropTypes
EVMStaffConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  onApprove: PropTypes.func.isRequired,
  onDeny: PropTypes.func.isRequired,
  onNeedMoreInfo: PropTypes.func.isRequired,

  isActionLoading: PropTypes.bool,
};
