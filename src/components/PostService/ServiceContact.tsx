
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ServiceContactProps {
  phone: string;
  email: string;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

const ServiceContact = ({ phone, email, onPhoneChange, onEmailChange }: ServiceContactProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-large font-semibold">رقم الهاتف *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0599123456"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="text-large"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-large font-semibold">البريد الإلكتروني *</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="text-large"
          required
        />
      </div>
    </div>
  );
};

export default ServiceContact;
