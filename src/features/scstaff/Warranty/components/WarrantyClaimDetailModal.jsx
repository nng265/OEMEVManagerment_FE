import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../../../components/molecules/Modal/Modal';
import { DetailModalActions } from '../../../../components/molecules/DetailModalActions/DetailModalActions';
import { BaseWarrantyDetailSection } from './BaseWarrantyDetailSection';
import './WarrantyClaimDetailModal.css';

// This component is now a WRAPPER - accepts children (additional action buttons)
export const WarrantyClaimDetailModal = ({ 
  isOpen, 
  onClose, 
  warrantyData, 
  title,
  children, // Additional action buttons (right side)
  showBackButton = true, // Always show Back/Cancel button on left by default
  backButtonLabel = "Back", // Label for Back button
  additionalContent // Additional content to render after BaseWarrantyDetailSection
}) => {
  if (!warrantyData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || `Warranty Claim Details - ${warrantyData.status || ''}`}
      size="lg"
      showFooter={false}
    >
      {/* Common information display section */}
      <BaseWarrantyDetailSection warrantyData={warrantyData} />

      {/* Additional content (e.g., assigned technicians section) */}
      {additionalContent}

      {/* Action buttons section - uses DetailModalActions component */}
      <DetailModalActions
        onBack={onClose}
        backLabel={backButtonLabel}
        showBackButton={showBackButton}
      >
        {children}
      </DetailModalActions>
    </Modal>
  );
};

WarrantyClaimDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  title: PropTypes.string,
  children: PropTypes.node,
  showBackButton: PropTypes.bool,
  backButtonLabel: PropTypes.string,
  additionalContent: PropTypes.node,
};

export default WarrantyClaimDetailModal;
