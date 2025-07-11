import { useFormValidation } from '@/hooks/useFormValidation';
import { 
  validateEmail, 
  validatePhone, 
  validateRequired, 
  validateTitle, 
  validateDescription 
} from '@/utils/formValidation';
import { ServiceFormData } from '@/types/service';

export const useServiceFormValidation = () => {
  const { validateField, setFieldTouched, hasErrors, getFieldError } = useFormValidation();

  const handleFieldBlur = (field: string, formData: ServiceFormData) => {
    setFieldTouched(field);
    
    switch (field) {
      case 'title':
        validateField(field, validateTitle(formData.title));
        break;
      case 'description':
        validateField(field, validateDescription(formData.description));
        break;
      case 'email':
        validateField(field, validateEmail(formData.email));
        break;
      case 'phone':
        validateField(field, validatePhone(formData.phone));
        break;
      case 'location':
        validateField(field, validateRequired(formData.location, 'المنطقة'));
        break;
      case 'price':
        validateField(field, validateRequired(formData.price, 'نطاق الأسعار'));
        break;
      case 'category':
        validateField(field, validateRequired(formData.category, 'فئة الخدمة'));
        break;
    }
  };

  const validateAllFields = (formData: ServiceFormData) => {
    const validations = [
      { field: 'title', validation: validateTitle(formData.title) },
      { field: 'category', validation: validateRequired(formData.category, 'فئة الخدمة') },
      { field: 'description', validation: validateDescription(formData.description) },
      { field: 'price', validation: validateRequired(formData.price, 'نطاق الأسعار') },
      { field: 'location', validation: validateRequired(formData.location, 'المنطقة') },
      { field: 'phone', validation: validatePhone(formData.phone) },
      { field: 'email', validation: validateEmail(formData.email) }
    ];

    let isValid = true;
    validations.forEach(({ field, validation }) => {
      if (!validateField(field, validation)) {
        isValid = false;
      }
      setFieldTouched(field);
    });

    return isValid;
  };

  return {
    handleFieldBlur,
    validateAllFields,
    getFieldError,
    hasValidationErrors: hasErrors
  };
};