
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Smartphone, 
  Banknote, 
  Building2
} from 'lucide-react';

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  phoneNumber: string;
  accountNumber: string;
}

interface PaymentMethodFormsProps {
  paymentMethod: string;
  paymentData: PaymentData;
  onInputChange: (field: string, value: string) => void;
}

const PaymentMethodForms = ({
  paymentMethod,
  paymentData,
  onInputChange
}: PaymentMethodFormsProps) => {
  if (paymentMethod === 'credit_card') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardholderName">اسم حامل البطاقة *</Label>
          <Input
            id="cardholderName"
            placeholder="الاسم كما يظهر على البطاقة"
            value={paymentData.cardholderName}
            onChange={(e) => onInputChange('cardholderName', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cardNumber">رقم البطاقة *</Label>
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={paymentData.cardNumber}
            onChange={(e) => onInputChange('cardNumber', e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">تاريخ الانتهاء *</Label>
            <Input
              id="expiryDate"
              placeholder="MM/YY"
              value={paymentData.expiryDate}
              onChange={(e) => onInputChange('expiryDate', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv">CVV *</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={paymentData.cvv}
              onChange={(e) => onInputChange('cvv', e.target.value)}
              required
            />
          </div>
        </div>
      </div>
    );
  }

  if (paymentMethod === 'jawwal_pay') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">رقم الهاتف المحمول *</Label>
          <Input
            id="phoneNumber"
            placeholder="0599123456"
            value={paymentData.phoneNumber}
            onChange={(e) => onInputChange('phoneNumber', e.target.value)}
            required
          />
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="text-blue-600" size={20} />
            <span className="font-semibold text-blue-800">Jawwal Pay</span>
          </div>
          <p className="text-blue-700 text-sm">
            سيتم إرسال رسالة نصية لرقمك لتأكيد الدفع
          </p>
        </div>
      </div>
    );
  }

  if (paymentMethod === 'reflect') {
    return (
      <div className="text-center p-6 border rounded-lg bg-green-50">
        <Building2 className="mx-auto mb-4 text-green-600" size={48} />
        <p className="text-lg mb-4">سيتم توجيهك إلى بوابة Reflect للدفع</p>
        <p className="text-sm text-green-700">
          بوابة الدفع الإلكتروني الفلسطينية الآمنة
        </p>
      </div>
    );
  }

  if (paymentMethod === 'bank_transfer') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Banknote className="text-yellow-600" size={20} />
          <span className="font-semibold text-yellow-800">تحويل بنكي</span>
        </div>
        <p className="text-yellow-700 text-sm">
          سيتم توجيهك لصفحة تفاصيل التحويل البنكي
        </p>
      </div>
    );
  }

  return null;
};

export default PaymentMethodForms;
