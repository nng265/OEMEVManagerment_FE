// src/features/warranty/components/SentToManufacturerModal.jsx

import React from "react";
import PropTypes from "prop-types";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";

export const SentToManufacturerModal = ({ isOpen, onClose, warrantyData }) => {
  if (!warrantyData) return null;

  return (
    <WarrantyClaimDetailModal
      isOpen={isOpen}
      onClose={onClose}
      warrantyData={warrantyData}
    />
  );
};

SentToManufacturerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
};

export default SentToManufacturerModal;
