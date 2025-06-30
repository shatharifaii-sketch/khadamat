
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';
import { useSubscription } from '@/hooks/useSubscription';
import { usePendingService } from '@/hooks/usePendingService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PendingServiceHandler = () => {
  const { user } = useAuth();
  const { createService } = useServices();
  const { canPostService } = useSubscription();
  const { pendingService, clearPendingService } = usePendingService();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePendingService = async () => {
      // Only proceed if user is authenticated and has pending service data
      if (!user || !pendingService) return;

      // Check if user can now post services (has subscription)
      if (canPostService()) {
        console.log('User can post service, creating pending service...');
        
        try {
          await createService.mutateAsync({
            title: pendingService.title,
            category: pendingService.category,
            description: pendingService.description,
            price_range: pendingService.price,
            location: pendingService.location,
            phone: pendingService.phone,
            email: pendingService.email,
            experience: pendingService.experience
          });
          
          // Clear pending service after successful creation
          clearPendingService();
          
          toast.success('تم نشر خدمتك بنجاح! مرحباً بك في المنصة');
          
          // Navigate to account page to see the service
          navigate('/account');
        } catch (error) {
          console.error('Error creating pending service:', error);
          toast.error('حدث خطأ في نشر الخدمة. يرجى المحاولة مرة أخرى');
        }
      }
    };

    // Small delay to ensure subscription data is loaded
    const timeoutId = setTimeout(handlePendingService, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [user, pendingService, canPostService, createService, clearPendingService, navigate]);

  return null; // This component doesn't render anything
};

export default PendingServiceHandler;
