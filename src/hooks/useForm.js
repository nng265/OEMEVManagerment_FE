import { useState, useCallback } from 'react';

export const useForm = ({
  initialValues = {},
  validate = () => ({}),
  onSubmit = () => {}
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set a specific field value
  const setFieldValue = useCallback((field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Set a specific field error
  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  // Mark a field as touched
  const setFieldTouched = useCallback((field, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
  }, []);

  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
  }, []);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    // Mark all fields as touched
    const touchedFields = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(touchedFields);

    // Validate form
    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,

    // Form handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Field helpers
    setFieldValue,
    setFieldError,
    setFieldTouched,

    // Form helpers
    resetForm,
    validateForm,

    // Dirty state
    isDirty: Object.keys(touched).length > 0,
    
    // Is the form valid?
    isValid: Object.keys(errors).length === 0
  };
};

export default useForm;
