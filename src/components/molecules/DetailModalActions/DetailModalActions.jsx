import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../atoms/Button/Button';
import './DetailModalActions.css';

/**
 * Standardized modal actions component
 * Back button on the left, action buttons on the right
 */
export const DetailModalActions = ({
  onBack,
  backLabel = 'Back',
  showBackButton = true,
  children,
  className = ''
}) => {
  return (
    <div className={`detail-modal-actions ${className}`}>
      {/* Back button - always on the left */}
      {showBackButton && (
        <Button variant="secondary" onClick={onBack}>
          {backLabel}
        </Button>
      )}
      
      {/* Action buttons - always on the right */}
      {children && (
        <div className="detail-modal-actions-right">
          {children}
        </div>
      )}
    </div>
  );
};

DetailModalActions.propTypes = {
  onBack: PropTypes.func.isRequired,
  backLabel: PropTypes.string,
  showBackButton: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string
};

export default DetailModalActions;
