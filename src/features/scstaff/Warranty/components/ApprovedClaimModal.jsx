// src/features/warranty/components/ApprovedClaimModal.jsx

import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";

export const ApprovedClaimModal = ({
  isOpen,
  onClose,
  warrantyData,
  onAction,
}) => {
  if (!warrantyData) return null;

  const handleCarBackHomeClick = () => onAction?.("carBackHome");

  return (
    <WarrantyClaimDetailModal
      isOpen={isOpen}
      onClose={onClose}
      warrantyData={warrantyData}
    >
      <Button variant="success" onClick={handleCarBackHomeClick}>
        Car Back Home
      </Button>
    </WarrantyClaimDetailModal>
  );
};

ApprovedClaimModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  onAction: PropTypes.func.isRequired,
};

export default ApprovedClaimModal;
