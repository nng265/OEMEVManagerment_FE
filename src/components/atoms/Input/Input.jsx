// src/components/atoms/Input/Input.jsx
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import "./Input.css";

export const Input = forwardRef(
  (
    {
      type = "text",
      placeholder,
      value,
      onChange,
      disabled = false,
      error,
      label,
      name,
      required = false,
      className = "",
      size = "md",
      hint,
      readOnly = false,
      fullWidth = false,
      // Props mới cho select
      options = [],
      // Props mới cho textarea
      rows,
      ...props
    },
    ref
  ) => {
    const wrapperClasses = [
      "input-wrapper",
      size && `input-${size}`,
      disabled && "input-disabled",
      error && "input-error",
      fullWidth && "input-full-width",
    ]
      .filter(Boolean)
      .join(" ");

    const inputClasses = [
      type === "textarea" ? "form-textarea" : "form-input",
      type === "select" && "form-select", // Thêm class cho select
      error ? "is-invalid" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const commonProps = {
      ref: ref,
      id: name,
      name: name,
      className: inputClasses,
      value: value,
      onChange: onChange,
      disabled: disabled,
      required: required,
      readOnly: readOnly,
      "aria-invalid": error ? "true" : "false",
      "aria-describedby": error ? `${name}-error` : undefined,
      ...props,
    };

    const renderInput = () => {
      if (type === "select") {
        return (
          <select {...commonProps}>
            {options.map((option, index) => (
              <option
                key={option.value || `opt-${index}`}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      if (type === "textarea") {
        return (
          <textarea
            {...commonProps}
            placeholder={placeholder}
            rows={rows || 3}
          />
        );
      }

      return <input type={type} placeholder={placeholder} {...commonProps} />;
    };

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={name} className="input-label">
            {label}
            {required && <span className="required-mark">*</span>}
          </label>
        )}
        <div className="input-container">{renderInput()}</div>
        {error && (
          <div className="invalid-feedback" id={`${name}-error`} role="alert">
            {error}
          </div>
        )}
        {hint && !error && <div className="input-hint">{hint}</div>}
      </div>
    );
  }
);

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
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  hint: PropTypes.node,
  readOnly: PropTypes.bool,
  fullWidth: PropTypes.bool,
  // Props cho select
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  // Props cho textarea
  rows: PropTypes.number,
};

Input.displayName = "Input";

export default Input;
