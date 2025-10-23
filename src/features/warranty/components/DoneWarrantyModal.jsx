// src/features/warranty/components/DoneWarrantyModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { WarrantyClaimDetailModal } from './WarrantyClaimDetailModal';

/**
 * Modal for "Done Warranty" status
 * Read-only modal - only shows Back button (left side)
 */
export const DoneWarrantyModal = ({ isOpen, onClose, warrantyData }) => {
  return (
    <WarrantyClaimDetailModal
      isOpen={isOpen}
      onClose={onClose}
      warrantyData={warrantyData}
      showBackButton={true}
      backButtonLabel="Back"
    >
      {/* No action buttons - only Back button will show on the left */}
    </WarrantyClaimDetailModal>
  );
};

DoneWarrantyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object
};
