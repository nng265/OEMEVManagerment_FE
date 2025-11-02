import React from "react";
import PropTypes from "prop-types";
import "./ConfirmDialog.css";

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-dialog-overlay" role="presentation">
      <div className="confirm-dialog" role="dialog" aria-modal="true">
        {title && <h4 className="confirm-dialog-title">{title}</h4>}
        {message && <p className="confirm-dialog-message">{message}</p>}

        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn-primary"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ConfirmDialog;
