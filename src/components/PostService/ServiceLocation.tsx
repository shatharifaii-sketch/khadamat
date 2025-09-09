import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { locations } from '../FindService/ServiceCategories';

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
    <Select
        value={location}
        onValueChange={onLocationChange}
      >
        <SelectTrigger id="location" onBlur={onLocationBlur}>
          <SelectValue placeholder="اختر المنطقة أو المحافظة" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
};

export default ServiceLocation;
