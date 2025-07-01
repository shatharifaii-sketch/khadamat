
import FormField from '@/components/ui/form-field';

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
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <FormField
        label="رقم الهاتف"
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
        label="البريد الإلكتروني"
        id="email"
        type="email"
        placeholder="example@email.com"
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
