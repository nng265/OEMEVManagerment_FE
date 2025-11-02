// src/components/molecules/DetailModalActions/DetailModalActions.jsx
import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../atoms/Button/Button";
import "./DetailModalActions.css"; // Make sure CSS is adjusted too

/**
 * Standardized modal actions component
 * Back button on the left, action buttons on the right
 */
export const DetailModalActions = ({
  onBack,
  backLabel = "Back", // Default to 'Back'
  showBackButton = true,
  children, // Action buttons (will be placed on the right)
  className = "",
}) => {
  return (
    <div className={`detail-modal-actions ${className}`}>
      {/* Back button - always shown on the left if showBackButton is true */}
      {showBackButton && (
        <Button variant="secondary" onClick={onBack}>
          {backLabel}
        </Button>
      )}

      {/* Action buttons - always grouped on the right */}
      {children && <div className="detail-modal-actions-right">{children}</div>}
    </div>
  );
};

DetailModalActions.propTypes = {
  onBack: PropTypes.func.isRequired,
  backLabel: PropTypes.string,
  showBackButton: PropTypes.bool,
  children: PropTypes.node, // Can be one or more buttons/elements
  className: PropTypes.string,
};

export default DetailModalActions;
