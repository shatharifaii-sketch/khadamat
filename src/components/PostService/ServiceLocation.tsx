
import FormField from '@/components/ui/form-field';

interface ServiceLocationProps {
  location: string;
  onLocationChange: (value: string) => void;
  onLocationBlur?: () => void;
  locationError?: string;
}

const ServiceLocation = ({
  location,
  onLocationChange,
  onLocationBlur,
  locationError
}: ServiceLocationProps) => {
  return (
    <FormField
      label="المنطقة/المحافظة"
      id="location"
      placeholder="مثال: رام الله، نابلس، غزة..."
      value={location}
      onChange={onLocationChange}
      onBlur={onLocationBlur}
      error={locationError}
      required
    />
  );
};

export default ServiceLocation;
