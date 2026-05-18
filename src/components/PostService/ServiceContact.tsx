
import FormField from '@/components/ui/form-field';
import { useTranslation } from 'react-i18next';

interface ServiceContactProps {
  phone: string;
  email: string;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneBlur?: () => void;
  onEmailBlur?: () => void;
  phoneError?: string;
  emailError?: string;
}

const ServiceContact = ({
  phone,
  email,
  onPhoneChange,
  onEmailChange,
  onPhoneBlur,
  onEmailBlur,
  phoneError,
  emailError
}: ServiceContactProps) => {
  const { t } = useTranslation("services");
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <FormField
        label={t("post_service.phone")}
        id="phone"
        type="tel"
        placeholder="0599123456"
        value={phone}
        onChange={onPhoneChange}
        onBlur={onPhoneBlur}
        error={phoneError}
        required
      />
      
      <FormField
        label={t("post_service.email")}
        id="email"
        type="email"
        placeholder="info@khedemtak.com"
        value={email}
        onChange={onEmailChange}
        onBlur={onEmailBlur}
        error={emailError}
        required
      />
    </div>
  );
};

export default ServiceContact;
