// src/features/warranty/components/CarBackHomeModal.jsx

import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";

export const CarBackHomeModal = ({
  isOpen,
  onClose,
  warrantyData,
  onAction,
}) => {
  if (!warrantyData) return null;

  const handleCarBackCenterClick = () => onAction?.("carBackCenter");

  return (
    <WarrantyClaimDetailModal
      isOpen={isOpen}
      onClose={onClose}
      warrantyData={warrantyData}
    >
      <Button variant="success" onClick={handleCarBackCenterClick}>
        Car Back Center
      </Button>
    </WarrantyClaimDetailModal>
  );
};

CarBackHomeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  onAction: PropTypes.func.isRequired,
};

export default CarBackHomeModal;
