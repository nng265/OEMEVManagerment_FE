// src/features/warranty/components/DeniedOrRepairedClaimModal.jsx

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
      >
        <Button variant="info" onClick={handleViewBill}>
          View Bill
        </Button>
        <Button variant="success" onClick={handleCustomerGetCarClick}>
          Customer Get Car
        </Button>
      </WarrantyClaimDetailModal>

      {/* Bill Preview Modal */}
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
