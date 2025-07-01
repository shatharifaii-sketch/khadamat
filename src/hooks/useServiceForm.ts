
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';
import { useSubscription } from '@/hooks/useSubscription';
import { usePendingService } from '@/hooks/usePendingService';
import { useFormValidation } from '@/hooks/useFormValidation';
import { 
  validateEmail, 
  validatePhone, 
  validateRequired, 
  validateTitle, 
  validateDescription 
} from '@/utils/formValidation';
import { toast } from 'sonner';

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  experience: string;
}

interface ServiceFormData {
  title: string;
  category: string;
  description: string;
  price: string;
  location: string;
  phone: string;
  email: string;
  experience: string;
}

export const useServiceForm = (serviceToEdit?: Service | null) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createService, updateService, isCreating, isUpdating } = useServices();
  const { canPostService } = useSubscription();
  const { pendingService, savePendingService, clearPendingService } = usePendingService();
  const { validateField, setFieldTouched, hasErrors, getFieldError } = useFormValidation();
  
  const isEditMode = !!serviceToEdit;
  
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    category: '',
    description: '',
    price: '',
    location: '',
    phone: '',
    email: user?.email || '',
    experience: '',
  });

  // Load service data for editing or pending service data
  useEffect(() => {
    if (serviceToEdit) {
      console.log('Loading service data for editing');
      setFormData({
        title: serviceToEdit.title,
        category: serviceToEdit.category,
        description: serviceToEdit.description,
        price: serviceToEdit.price_range,
        location: serviceToEdit.location,
        phone: serviceToEdit.phone,
        email: serviceToEdit.email,
        experience: serviceToEdit.experience || '',
      });
    } else if (pendingService && !isEditMode) {
      console.log('Loading pending service data into form');
      setFormData(pendingService);
    }
  }, [serviceToEdit, pendingService, isEditMode]);

  // Update email when user changes
  useEffect(() => {
    if (user?.email && !formData.email && !isEditMode) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user?.email, isEditMode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field: string) => {
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

  const validateAllFields = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    // If we're editing, update the service
    if (isEditMode && serviceToEdit) {
      try {
        await updateService.mutateAsync({
          id: serviceToEdit.id,
          title: formData.title,
          category: formData.category,
          description: formData.description,
          price_range: formData.price,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          experience: formData.experience
        });
        
        navigate('/account');
      } catch (error) {
        console.error('Error updating service:', error);
      }
      return;
    }

    // Check if user can post more services (for new services only)
    if (!canPostService()) {
      // Save the service data before redirecting to payment
      savePendingService(formData);
      
      // Redirect to payment page
      navigate('/payment', { 
        state: { 
          serviceData: formData,
          servicesNeeded: 2 // Default package
        } 
      });
      return;
    }

    try {
      await createService.mutateAsync({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price_range: formData.price,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        experience: formData.experience
      });
      
      // Clear pending service data after successful creation
      clearPendingService();
      
      // Navigate to account page to see the service
      navigate('/account');
    } catch (error) {
      console.error('Error submitting service:', error);
    }
  };

  return {
    formData,
    handleInputChange,
    handleSubmit,
    handleFieldBlur,
    isEditMode,
    isCreating,
    isUpdating,
    canPostService: isEditMode || canPostService(),
    pendingService,
    getFieldError,
    hasValidationErrors: hasErrors
  };
};
