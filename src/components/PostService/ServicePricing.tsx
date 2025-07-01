
import FormField from '@/components/ui/form-field';

interface ServicePricingProps {
  price: string;
  onPriceChange: (value: string) => void;
  onPriceBlur?: () => void;
  priceError?: string;
}

const ServicePricing = ({
  price,
  onPriceChange,
  onPriceBlur,
  priceError
}: ServicePricingProps) => {
  return (
    <FormField
      label="نطاق الأسعار"
      id="price"
      placeholder="مثال: 200-500 شيكل"
      value={price}
      onChange={onPriceChange}
      onBlur={onPriceBlur}
      error={priceError}
      required
    />
  );
};

export default ServicePricing;
