import { useFormValidation } from '@/hooks/useFormValidation';
import { 
  validateEmail, 
  validatePhone, 
  validateRequired, 
  validateTitle, 
  validateDescription, 
  validateLocation,
  validateLinks,
  validateWhatsappNumber
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
      case 'links':
        validateField(field, validateLinks(formData.links,));
        break;
      case 'whatsapp_number':
        validateField(field, validateWhatsappNumber(formData.whatsapp_number));
        break;
      case 'is_online':
        // No validation needed for boolean field, but we can mark it as touched
        setFieldTouched(field);
        break;
      case 'location':
        validateField(field, validateLocation(formData.location, 'المنطقة'));
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
      { field: 'links', validation: validateLinks(formData.links) },
      { field: 'whatsapp_number', validation: validateWhatsappNumber(formData.whatsapp_number) },
      { field: 'price', validation: validateRequired(formData.price, 'نطاق الأسعار') },
      { field: 'location', validation: validateLocation(formData.location, 'المنطقة') },
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