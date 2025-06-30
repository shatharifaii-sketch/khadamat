
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
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

const PaymentMethodSelector = ({ 
  paymentMethod, 
  onPaymentMethodChange 
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
      id: 'jawwal_pay',
      name: 'Jawwal Pay',
      description: 'المحفظة الإلكترونية',
      icon: Smartphone,
      available: true
    },
    {
      id: 'credit_card',
      name: 'بطاقة ائتمانية',
      description: 'فيزا أو ماستركارد',
      icon: CreditCard,
      available: true
    },
    {
      id: 'bank_transfer',
      name: 'تحويل بنكي',
      description: 'تحويل مباشر من البنك',
      icon: Banknote,
      available: true
    }
  ];

  return (
    <div className="space-y-4">
      <Label className="text-large font-semibold">اختر طريقة الدفع</Label>
      <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
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
