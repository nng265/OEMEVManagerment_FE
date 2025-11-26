import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { DetailModalActions } from "../../../../components/molecules/DetailModalActions/DetailModalActions";
import { BaseWarrantyDetailSection } from "./BaseWarrantyDetailSection";
import "./WarrantyClaimDetailModal.css";

export const WarrantyClaimDetailModal = ({
  isOpen,
  onClose,
  warrantyData,
  title,
  children,
  showBackButton = true,
  backButtonLabel = "Cancel",
  additionalContent,
}) => {
  if (!warrantyData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || `Warranty Claim Details - ${warrantyData.status || ""}`}
      size="lg"
      showFooter={false}
    >
      <BaseWarrantyDetailSection warrantyData={warrantyData} />

      {additionalContent}

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
