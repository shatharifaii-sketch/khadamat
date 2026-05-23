import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useSubscription } from '@/hooks/useSubscription';
import { usePendingService } from '@/hooks/usePendingService';
import { ServiceFormData } from '@/types/service';
import { toast } from 'sonner';
import { Service } from './useAdminFunctionality';
import { formatWhatsappNumber } from '@/utils/formValidation';
import { useTranslation } from 'react-i18next';

export const useServiceFormSubmission = (serviceToEdit?: Service | null) => {
  const navigate = useNavigate();
  const { createService, updateService, isCreating, isUpdating, saveImages } = useServices();
  const { canPostService } = useSubscription();
  const { savePendingService, clearPendingService } = usePendingService();
  
  const isEditMode = !!serviceToEdit;

  const handleSubmit = async (formData: ServiceFormData) => {
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
          experience: formData.experience,
          is_online: formData.is_online,
          links: formData.links,
          whatsapp_number: formatWhatsappNumber({
            countryCode: formData.whatsapp_number.countryCode,
            number: formData.whatsapp_number.number
          })
        });

        if (formData.images && formData.images.length > 0) {
        await saveImages({
          serviceId: serviceToEdit.id,
          images: formData.images
        });
      }
        
        navigate('/account');
      } catch (error) {
        console.error('Error updating service:', error);
      }
      return;
    }

    // Check if user can post more services (for new services only)
    const canPost = canPostService;
    if (!canPost.canPost) {
      clearPendingService();
      // Save the service data before redirecting to payment
      savePendingService(formData);
      
      // Redirect to payment page for additional service
      
      return;
    }

    try {
      const result = await createService.mutateAsync({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price_range: formData.price,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        experience: formData.experience,
        is_online: formData.is_online,
        links: formData.links,
        whatsapp_number: formatWhatsappNumber({
          countryCode: formData.whatsapp_number.countryCode,
          number: formData.whatsapp_number.number
        })
      });

      //TODO: Handle image uploads here if necessary
      if (formData.images && formData.images.length > 0) {
        await saveImages({
          serviceId: result.id,
          images: formData.images
        });
      }
    
      // Clear pending service data after successful creation
      clearPendingService();

      // Navigate to account page to see the service
      navigate('/account', { state: { servicePending: true }});
    } catch (error) {
      console.error('Error submitting service:', error);
    }
  };

  return {
    handleSubmit,
    isCreating,
    isUpdating,
    canPostService: canPostService
  };
};