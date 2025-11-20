import { useState, useCallback } from "react";

export const useForm = ({
  initialValues = {},
  validate = () => ({}),
  onSubmit = () => {},
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const setFieldTouched = useCallback((field, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [field]: isTouched,
    }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const validateForm = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      const touchedFields = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(touchedFields);

      const isValid = validateForm();
      if (!isValid) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
        setErrors((prev) => ({
          ...prev,
          submit: error.message,
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  return {
    // form state
    values,
    errors,
    touched,
    isSubmitting,

    // form handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // field helpers
    setFieldValue,
    setFieldError,
    setFieldTouched,

    // form helpers
    resetForm,
    validateForm,

    // dirty state
    isDirty: Object.keys(touched).length > 0,

    // the form is valid
    isValid: Object.keys(errors).length === 0,
  };
};

export default useForm;
