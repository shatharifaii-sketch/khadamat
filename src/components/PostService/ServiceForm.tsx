
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import ServiceBasicInfo from './ServiceBasicInfo';
import ServicePricing from './ServicePricing';
import ServiceLocation from './ServiceLocation';
import ServiceContact from './ServiceContact';
import ServiceExperience from './ServiceExperience';
import ServicePortfolio from './ServicePortfolio';
import ServiceFormSubmit from './ServiceFormSubmit';

const ServiceForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createService, isCreating } = useServices();
  const { canPostService } = useSubscription();
  
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description || !formData.price || !formData.location || !formData.phone) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Check if user can post more services
    if (!canPostService()) {
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
      
      // Navigate to account page to see the service
      navigate('/account');
    } catch (error) {
      console.error('Error submitting service:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">تفاصيل الخدمة</CardTitle>
        <CardDescription className="text-large">
          املأ المعلومات التالية لنشر خدمتك
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
            isCreating={isCreating}
            canPostService={canPostService()}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
