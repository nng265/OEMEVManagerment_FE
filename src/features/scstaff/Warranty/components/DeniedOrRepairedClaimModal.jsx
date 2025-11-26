import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
import { WarrantyBillModal } from "./WarrantyBillModal";

export const DeniedOrRepairedClaimModal = ({
  isOpen,
  onClose,
  warrantyData,
  onAction,
}) => {
  const [showBillModal, setShowBillModal] = useState(false);

  if (!warrantyData) return null;

  const handleCustomerGetCarClick = () => onAction?.("doneWarranty");

  const denialContent = warrantyData?.denialReason ? (
    <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
      <div className="detail-item">
       <h5>Denial Reason:</h5>
        <div className="value" style={{ marginTop: "8px" }}>
          {/* Chỉ show detail nếu reason = Other */}
        {warrantyData.denialReason === "Other" && (
          <div style={{ marginTop: "6px" }}>
            {warrantyData.denialReasonDetail}
          </div>
        )}
        {warrantyData.denialReason !== "Other" && (
          <div style={{ marginTop: "6px" }}>
            {warrantyData.denialReason}
          </div>
        )}
        </div>
      </div>
    </div>
  ) : null;

  const handleViewBill = () => {
    setShowBillModal(true);
  };

  const handleCloseBillModal = () => {
    setShowBillModal(false);
  };

  return (
    <>
      <WarrantyClaimDetailModal
        isOpen={isOpen}
        onClose={onClose}
        warrantyData={warrantyData}
        additionalContent={denialContent}
      >
        <Button variant="light" onClick={handleViewBill}>
          View Bill
        </Button>
        <Button variant="success" onClick={handleCustomerGetCarClick}>
          Customer Get Car
        </Button>
      </WarrantyClaimDetailModal>

      <WarrantyBillModal
        isOpen={showBillModal}
        onClose={handleCloseBillModal}
        warrantyData={warrantyData}
      />
    </>
  );
};

DeniedOrRepairedClaimModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  onAction: PropTypes.func.isRequired,
};

export default DeniedOrRepairedClaimModal;
