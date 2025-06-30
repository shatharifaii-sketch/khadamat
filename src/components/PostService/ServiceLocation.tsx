
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ServiceLocationProps {
  location: string;
  onLocationChange: (value: string) => void;
}

const ServiceLocation = ({ location, onLocationChange }: ServiceLocationProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="location" className="text-large font-semibold">المنطقة/المحافظة *</Label>
      <Input
        id="location"
        placeholder="مثال: رام الله، نابلس، غزة..."
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        className="text-large"
        required
      />
    </div>
  );
};

export default ServiceLocation;
