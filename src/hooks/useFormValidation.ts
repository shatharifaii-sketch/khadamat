
import { useState } from 'react';
import { ValidationResult } from '@/utils/formValidation';

interface FormErrors {
  [key: string]: string;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (fieldName: string, validationResult: ValidationResult) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: validationResult.isValid ? '' : validationResult.message
    }));
    return validationResult.isValid;
  };

  const setFieldTouched = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const clearError = (fieldName: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  const hasErrors = () => {
    return Object.values(errors).some(error => error !== '');
  };

  const getFieldError = (fieldName: string) => {
    return touched[fieldName] ? errors[fieldName] : '';
  };

  return {
    errors,
    touched,
    validateField,
    setFieldTouched,
    clearError,
    hasErrors,
    getFieldError,
    setErrors,
    setTouched
  };
};
