
import { Card, CardContent } from '@/components/ui/card';
import { useServiceForm } from '@/hooks/useServiceForm';
import { Service } from '@/types/service';
import ServiceFormHeader from './ServiceFormHeader';
import ServiceBasicInfo from './ServiceBasicInfo';
import ServicePricing from './ServicePricing';
import ServiceLocation from './ServiceLocation';
import ServiceContact from './ServiceContact';
import ServiceExperience from './ServiceExperience';
import ServicePortfolio from './ServicePortfolio';
import ServiceFormSubmit from './ServiceFormSubmit';

interface ServiceFormProps {
  serviceToEdit?: Service | null;
}

const ServiceForm = ({ serviceToEdit }: ServiceFormProps) => {
  const {
    formData,
    handleInputChange,
    handleSubmit,
    handleFieldBlur,
    isEditMode,
    isCreating,
    isUpdating,
    canPostService,
    pendingService,
    getFieldError
  } = useServiceForm(serviceToEdit);

  return (
    <Card>
      <ServiceFormHeader 
        isEditMode={isEditMode} 
        hasPendingService={!!pendingService && !isEditMode} 
      />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ServiceBasicInfo
            title={formData.title}
            category={formData.category}
            description={formData.description}
            onTitleChange={(value) => handleInputChange('title', value)}
            onCategoryChange={(value) => handleInputChange('category', value)}
            onDescriptionChange={(value) => handleInputChange('description', value)}
            onTitleBlur={() => handleFieldBlur('title')}
            onDescriptionBlur={() => handleFieldBlur('description')}
            titleError={getFieldError('title')}
            categoryError={getFieldError('category')}
            descriptionError={getFieldError('description')}
          />

          <ServicePricing
            price={formData.price}
            onPriceChange={(value) => handleInputChange('price', value)}
            onPriceBlur={() => handleFieldBlur('price')}
            priceError={getFieldError('price')}
          />

          <ServiceLocation
            location={formData.location}
            onLocationChange={(value) => handleInputChange('location', value)}
            onLocationBlur={() => handleFieldBlur('location')}
            locationError={getFieldError('location')}
          />

          <ServiceContact
            phone={formData.phone}
            email={formData.email}
            onPhoneChange={(value) => handleInputChange('phone', value)}
            onEmailChange={(value) => handleInputChange('email', value)}
            onPhoneBlur={() => handleFieldBlur('phone')}
            onEmailBlur={() => handleFieldBlur('email')}
            phoneError={getFieldError('phone')}
            emailError={getFieldError('email')}
          />

          <ServiceExperience
            experience={formData.experience}
            onExperienceChange={(value) => handleInputChange('experience', value)}
          />

          <ServicePortfolio onImagesChange={(images) => {
            // Store images in form data for potential future use
            console.log('Portfolio images updated:', images.length);
          }} />

          <ServiceFormSubmit
            isCreating={isCreating || isUpdating}
            canPostService={canPostService}
            isEditMode={isEditMode}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
