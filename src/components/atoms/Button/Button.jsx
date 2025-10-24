import React from 'react';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  isLoading = false,
  loadingText = 'Loading...',
  icon,
  fullWidth = false,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const loadingClass = isLoading ? 'btn-loading' : '';
  
  const classes = [baseClass, variantClass, sizeClass, loadingClass, fullWidth ? 'btn-full-width' : '', className]
    .filter(Boolean)
    .join(' ');

  const content = isLoading ? (
    <>
      <LoadingSpinner size="sm" />
      <span className="btn-text">{loadingText || children}</span>
    </>
  ) : (
    <>
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
    </>
  );

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  icon: PropTypes.node,
  fullWidth: PropTypes.bool
};

export default Button;
