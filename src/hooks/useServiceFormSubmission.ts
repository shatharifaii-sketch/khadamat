import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useSubscription } from '@/hooks/useSubscription';
import { usePendingService } from '@/hooks/usePendingService';
import { toast } from 'sonner';
import { Service, ServiceFormData } from '@/types/service';

export const useServiceFormSubmission = (serviceToEdit?: Service | null) => {
  const navigate = useNavigate();
  const { createService, updateService, isCreating, isUpdating } = useServices();
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
          experience: formData.experience
        });
        
        navigate('/account');
      } catch (error) {
        console.error('Error updating service:', error);
      }
      return;
    }

    // Check if user can post more services (for new services only)
    const canPost = canPostService;
    if (!canPost) {
      // Save the service data before redirecting to payment
      savePendingService(formData);
      
      // Redirect to payment page for additional service
      
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
    handleSubmit,
    isCreating,
    isUpdating,
    canPostService: canPostService
  };
};