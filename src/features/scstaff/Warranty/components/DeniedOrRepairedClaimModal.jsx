// src/features/warranty/components/DeniedOrRepairedClaimModal.jsx

import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";

export const DeniedOrRepairedClaimModal = ({
  isOpen,
  onClose,
  warrantyData,
  onAction,
}) => {
  if (!warrantyData) return null;

  const handleCustomerGetCarClick = () => onAction?.("doneWarranty");

  return (
    <WarrantyClaimDetailModal
      isOpen={isOpen}
      onClose={onClose}
      warrantyData={warrantyData}
    >
      <Button variant="success" onClick={handleCustomerGetCarClick}>
        Customer Get Car
      </Button>
    </WarrantyClaimDetailModal>
  );
};

DeniedOrRepairedClaimModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  onAction: PropTypes.func.isRequired,
};

export default DeniedOrRepairedClaimModal;
