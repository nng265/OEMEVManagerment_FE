import React from "react";
import PropTypes from "prop-types";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";

export const DoneWarrantyModal = ({ isOpen, onClose, warrantyData }) => {
  return (
    <WarrantyClaimDetailModal
      isOpen={isOpen}
      onClose={onClose}
      warrantyData={warrantyData}
      showBackButton={true}
      backButtonLabel="Back"
    ></WarrantyClaimDetailModal>
  );
};

DoneWarrantyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
};
