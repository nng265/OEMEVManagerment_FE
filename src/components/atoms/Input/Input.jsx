import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Input.css';

export const Input = forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  name,
  required = false,
  className = '',
  size = 'md',
  prefix,
  suffix,
  hint,
  readOnly = false,
  fullWidth = false,
  ...props
}, ref) => {
  const wrapperClasses = [
    'input-wrapper',
    size && `input-${size}`,
    disabled && 'input-disabled',
    error && 'input-error',
    (prefix || suffix) && 'input-with-affix',
    fullWidth && 'input-full-width'
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'form-input',
    error ? 'is-invalid' : '',
    prefix ? 'has-prefix' : '',
    suffix ? 'has-suffix' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <div className="input-container">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && (
        <div className="invalid-feedback" id={`${name}-error`} role="alert">
          {error}
        </div>
      )}
      {hint && !error && (
        <div className="input-hint">
          {hint}
        </div>
      )}
    </div>
  );
});

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  hint: PropTypes.node,
  readOnly: PropTypes.bool
};

Input.displayName = 'Input';

export default Input;
