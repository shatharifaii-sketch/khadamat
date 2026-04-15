import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { locations } from '../FindService/ServiceCategories';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface ServiceLocationProps {
  location: string;
  onLocationChange: (value: string) => void;
  onLocationBlur?: () => void;
  locationError?: string;
  is_online: boolean;
  onOnlineChange: (value: boolean) => void;
}

const ServiceLocation = ({
  location,
  onLocationChange,
  onLocationBlur,
  locationError,
  is_online,
  onOnlineChange
}: ServiceLocationProps) => {
  return (
    <div className='flex flex-col gap-2'>
      <Label htmlFor="location">الموقع</Label>
      {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
      <div className='grid grid-cols-2 my-2'>
        <div className='flex items-center gap-2'>
          <Checkbox
            id="offline"
            checked={!is_online}
            onCheckedChange={() => onOnlineChange(false)}
          />
          <Label htmlFor="offline">خدمة في الموقع</Label>
        </div>

        <div className='flex items-center gap-2'>
          <Checkbox
            id="online"
            checked={is_online}
            onCheckedChange={() => onOnlineChange(true)}
          />
          <Label htmlFor="online">اونلاين</Label>
        </div>
      </div>
      <Select
        value={location}
        onValueChange={onLocationChange}
        disabled={is_online}
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
    </div>
  );
};

export default ServiceLocation;
