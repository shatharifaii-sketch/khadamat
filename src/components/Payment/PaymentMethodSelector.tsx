
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

const methodIcons = [
  'jawwalpay.png',
  'Mastercard-logo.png',
  'pal-pay.png',
  'pay-pal.png',
  'visa.png'
]

const PaymentMethodSelector = ({
  selectedMethod,
  onMethodChange
}: PaymentMethodSelectorProps) => {

  return (
    <div className="space-y-4">
      {/*<Label className="text-large font-semibold">اختر طريقة الدفع</Label>
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
      </RadioGroup>*/}
      <Label>طريقة الدفع</Label>
      <p>يمكنك الدفع عن طريق:</p>
      <div className=' shadow-md px-2 pt-2 pb-3 rounded-lg shadow-primary/40 flex flex-col gap-2' dir='ltr'>
        <div className='flex items-end gap-2'>
          <img src='/logo1.png' />
        </div>
        <div className='flex items-center w-full gap-2 justify-start px-2'>
          {methodIcons.map((icon, index) => (
            <div key={index}>
              <img src={`/${icon}`} className='w-8 h-fit' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
