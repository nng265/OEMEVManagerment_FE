import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";

export const DeleteAccountModal = ({ isOpen, onClose, account, onDelete }) => {
  if (!account) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
      size="md"
      showFooter={false}
    >
      <p>Are you sure you want to delete account:</p>
      <strong>{account.userId}</strong>

      <div className="modal-footer" style={{ marginTop: "20px" }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => onDelete(account.userId)}>
          Delete
        </Button>
      </div>
    </Modal>
  );
};

DeleteAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  policy: PropTypes.object,
  onDelete: PropTypes.func.isRequired,
};

export default DeleteAccountModal;
