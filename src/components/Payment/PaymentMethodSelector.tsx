
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building2
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
  available: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodChange 
}: PaymentMethodSelectorProps) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'reflect',
      name: 'Reflect',
      description: 'بوابة الدفع الفلسطينية',
      icon: Building2,
      available: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'الدفع عبر بايبال',
      icon: CreditCard,
      available: true
    },
    {
      id: 'jawwal_pay',
      name: 'Jawwal Pay',
      description: 'المحفظة الإلكترونية',
      icon: Smartphone,
      available: true
    }
  ];

  return (
    <div className="space-y-4">
      <Label className="text-large font-semibold">اختر طريقة الدفع</Label>
      <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value={method.id} id={method.id} disabled={!method.available} />
              <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer flex-1">
                <Icon size={20} />
                <div>
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-muted-foreground">{method.description}</div>
                </div>
              </Label>
              {!method.available && (
                <span className="text-xs text-red-500">قريباً</span>
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
