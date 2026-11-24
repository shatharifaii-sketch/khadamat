
import FormField from '@/components/ui/form-field';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation("services");
  return (
    <FormField
      label={t("post_service.price")}
      id="price"
      placeholder={t("post_service.price_placeholder")}
      value={price}
      onChange={onPriceChange}
      onBlur={onPriceBlur}
      error={priceError}
      required
    />
  );
};

export default ServicePricing;
