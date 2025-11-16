import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";

export const DeletePolicyModal = ({ isOpen, onClose, policy, onDelete }) => {
  if (!policy) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Policy"
      size="md"
      showFooter={false}
    >
      <p>Are you sure you want to delete policy:</p>
      <strong>{policy.policyName}</strong>

      <div className="modal-footer" style={{ marginTop: "20px" }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => onDelete(policy.policyId)}>
          Delete
        </Button>
      </div>
    </Modal>
  );
};

DeletePolicyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  policy: PropTypes.object,
  onDelete: PropTypes.func.isRequired,
};

export default DeletePolicyModal;
