import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { usePendingService } from '@/hooks/usePendingService';
import ServiceBasicInfo from './ServiceBasicInfo';
import ServicePricing from './ServicePricing';
import ServiceLocation from './ServiceLocation';
import ServiceContact from './ServiceContact';
import ServiceExperience from './ServiceExperience';
import ServicePortfolio from './ServicePortfolio';
import ServiceFormSubmit from './ServiceFormSubmit';

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

interface ServiceFormProps {
  serviceToEdit?: Service | null;
}

const ServiceForm = ({ serviceToEdit }: ServiceFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createService, updateService, isCreating, isUpdating } = useServices();
  const { canPostService } = useSubscription();
  const { pendingService, savePendingService, clearPendingService } = usePendingService();
  
  const isEditMode = !!serviceToEdit;
  
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description || !formData.price || !formData.location || !formData.phone) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {isEditMode ? 'تعديل الخدمة' : 'تفاصيل الخدمة'}
        </CardTitle>
        <CardDescription className="text-large">
          {isEditMode ? 'قم بتعديل معلومات خدمتك' : 'املأ المعلومات التالية لنشر خدمتك'}
          {pendingService && !isEditMode && (
            <span className="block mt-2 text-green-600 font-medium">
              ✓ تم استرداد بياناتك المحفوظة
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ServiceBasicInfo
            title={formData.title}
            category={formData.category}
            description={formData.description}
            onTitleChange={(value) => handleInputChange('title', value)}
            onCategoryChange={(value) => handleInputChange('category', value)}
            onDescriptionChange={(value) => handleInputChange('description', value)}
          />

          <ServicePricing
            price={formData.price}
            onPriceChange={(value) => handleInputChange('price', value)}
          />

          <ServiceLocation
            location={formData.location}
            onLocationChange={(value) => handleInputChange('location', value)}
          />

          <ServiceContact
            phone={formData.phone}
            email={formData.email}
            onPhoneChange={(value) => handleInputChange('phone', value)}
            onEmailChange={(value) => handleInputChange('email', value)}
          />

          <ServiceExperience
            experience={formData.experience}
            onExperienceChange={(value) => handleInputChange('experience', value)}
          />

          <ServicePortfolio />

          <ServiceFormSubmit
            isCreating={isCreating || isUpdating}
            canPostService={isEditMode || canPostService()}
            isEditMode={isEditMode}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
