import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

export const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '', 
  screenReaderText = 'Loading...' 
}) => {
  const spinnerClasses = [
    'spinner',
    `spinner-${size}`,
    `spinner-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={spinnerClasses}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">{screenReaderText}</span>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  className: PropTypes.string,
  screenReaderText: PropTypes.string
};
