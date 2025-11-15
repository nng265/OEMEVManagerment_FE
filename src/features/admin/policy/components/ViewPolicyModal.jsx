import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import "./PolicyList.css";

export const ViewPolicyModal = ({ isOpen, onClose, policy }) => {
  if (!policy) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={policy.name || "Policy Detail"}
      size="xl"
      showFooter={false}
    >
      <div className="policy-modal">
        {/* === Section 1: Policy Overview === */}
        <h3 className="policy-section-title">Policy Information</h3>

        <div className="policy-info-row">
          <div className="policy-info-block full-width">
            <span className="info-block-label">Policy Name</span>
            <span className="info-block-value">{policy.policyName}</span>
          </div>
        </div>

        {/* === Section 2: Policy Details === */}
        <h3 className="policy-section-title">Coverage Details</h3>

        <div className="policy-info-row">
          <div className="policy-info-block">
            <span className="info-block-label">Policy ID</span>
            <span className="info-block-value">{policy.policyId}</span>
          </div>

          <div className="policy-info-block">
            <span className="info-block-label">Coverage Period (Months)</span>
            <span className="info-block-value">
              {policy.coveragePeriodMonths}
            </span>
          </div>
        </div>

        {/* === Section 3: Conditions === */}
        <h3 className="policy-section-title">Conditions</h3>
        <div className="policy-info-row">
          <div className="policy-info-block full-width">
            <span className="info-block-value policy-conditions">
              {policy.conditions || "No specific conditions listed."}
            </span>
          </div>
        </div>

        {/* === Footer === */}
        <div className="policy-footer">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ViewPolicyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  policy: PropTypes.object,
};

export default ViewPolicyModal;
