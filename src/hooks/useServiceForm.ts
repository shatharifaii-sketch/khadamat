
import { toast } from 'sonner';
import { usePendingService } from '@/hooks/usePendingService';
import { useServiceFormState } from '@/hooks/useServiceFormState';
import { useServiceFormValidation } from '@/hooks/useServiceFormValidation';
import { useServiceFormSubmission } from '@/hooks/useServiceFormSubmission';
import { Service } from '@/types/service';

export const useServiceForm = (serviceToEdit?: Service | null) => {
  const { pendingService } = usePendingService();
  
  const {
    formData,
    handleInputChange,
    isEditMode
  } = useServiceFormState(serviceToEdit);

  const {
    handleFieldBlur: validateFieldBlur,
    validateAllFields,
    getFieldError,
    hasValidationErrors
  } = useServiceFormValidation();

  const {
    handleSubmit: submitForm,
    isCreating,
    isUpdating,
    canPostService: canPostServiceAsync
  } = useServiceFormSubmission(serviceToEdit);

  const handleFieldBlur = (field: string) => {
    validateFieldBlur(field, formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields(formData)) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    await submitForm(formData);
  };

  return {
    formData,
    handleInputChange,
    handleSubmit,
    handleFieldBlur,
    isEditMode,
    isCreating,
    isUpdating,
    canPostService: isEditMode ? true : false, // For display purposes, actual check is in handleSubmit
    pendingService,
    getFieldError,
    hasValidationErrors,
    canPostServiceAsync
  };
};
