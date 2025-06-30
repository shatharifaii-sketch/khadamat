
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ServicePricingProps {
  price: string;
  onPriceChange: (value: string) => void;
}

const ServicePricing = ({ price, onPriceChange }: ServicePricingProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="price" className="text-large font-semibold">نطاق الأسعار *</Label>
      <Input
        id="price"
        placeholder="مثال: 200-500 شيكل"
        value={price}
        onChange={(e) => onPriceChange(e.target.value)}
        className="text-large"
        required
      />
    </div>
  );
};

export default ServicePricing;
