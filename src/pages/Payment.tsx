
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import PaymentOrderSummary from '@/components/Payment/PaymentOrderSummary';
import PaymentMethodSelector from '@/components/Payment/PaymentMethodSelector';
import PaymentMethodForms from '@/components/Payment/PaymentMethodForms';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createPaymentTransaction, completePayment, getUserSubscription } = useSubscription();
  
  const serviceData = location.state?.serviceData;
  const servicesNeeded = location.state?.servicesNeeded || 2;
  const amount = servicesNeeded * 5; // 5 NIS per service (10 NIS for 2 services)

  const [paymentMethod, setPaymentMethod] = useState('reflect');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    phoneNumber: '',
    accountNumber: ''
  });

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  const subscription = getUserSubscription.data;

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create payment transaction
      const transaction = await createPaymentTransaction.mutateAsync({
        amount,
        currency: 'ILS',
        payment_method: paymentMethod,
        services_quota: servicesNeeded,
        status: 'pending',
        payment_data: paymentData
      });

      // Simulate payment processing based on method
      if (paymentMethod === 'reflect') {
        // Redirect to Reflect payment gateway
        window.open(`https://reflect.ps/payment?amount=${amount}&reference=${transaction.id}`, '_blank');
        
        // For demo purposes, we'll simulate successful payment after a delay
        setTimeout(async () => {
          await completePayment.mutateAsync({ 
            transactionId: transaction.id,
            externalTransactionId: `reflect_${Date.now()}`
          });
          navigate('/account');
        }, 5000);
        
      } else if (paymentMethod === 'jawwal_pay') {
        // Simulate Jawwal Pay USSD or app integration
        alert(`سيتم إرسال رسالة نصية إلى ${paymentData.phoneNumber} لتأكيد الدفع`);
        
        // Simulate successful payment
        setTimeout(async () => {
          await completePayment.mutateAsync({ 
            transactionId: transaction.id,
            externalTransactionId: `jawwal_${Date.now()}`
          });
          navigate('/account');
        }, 3000);
        
      } else if (paymentMethod === 'credit_card') {
        // Process credit card through local gateway
        alert('سيتم معالجة الدفع عبر البطاقة الائتمانية...');
        
        // Simulate processing
        setTimeout(async () => {
          await completePayment.mutateAsync({ 
            transactionId: transaction.id,
            externalTransactionId: `card_${Date.now()}`
          });
          navigate('/account');
        }, 4000);
        
      } else if (paymentMethod === 'bank_transfer') {
        // Show bank details for transfer
        alert('سيتم توجيهك لتفاصيل التحويل البنكي');
        navigate('/bank-transfer', { state: { transaction } });
      }
      
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            إتمام الدفع
          </h1>
          <p className="text-xl text-muted-foreground">
            ادفع لتتمكن من نشر خدماتك
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <PaymentOrderSummary 
            subscription={subscription}
            servicesNeeded={servicesNeeded}
            amount={amount}
            serviceData={serviceData}
          />

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">طريقة الدفع</CardTitle>
              <CardDescription>
                اختر طريقة الدفع المناسبة لك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment Method Selection */}
                <PaymentMethodSelector 
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                />

                <Separator />

                {/* Payment Method Specific Forms */}
                <PaymentMethodForms 
                  paymentMethod={paymentMethod}
                  paymentData={paymentData}
                  onInputChange={handleInputChange}
                />

                <div className="space-y-4 pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-xl py-6"
                    disabled={createPaymentTransaction.isPending}
                  >
                    <ArrowRight className="ml-2" size={20} />
                    {createPaymentTransaction.isPending ? 'جاري المعالجة...' : `ادفع ${amount} شيكل`}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    className="w-full text-xl py-6"
                    onClick={() => navigate('/post-service', { state: { serviceData } })}
                  >
                    <ArrowLeft className="ml-2" size={20} />
                    العودة
                  </Button>
                </div>

                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-gray-600" size={16} />
                    <span className="font-semibold text-gray-800">ملاحظة مهمة</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    بعد إتمام الدفع بنجاح، ستتمكن من نشر خدماتك فوراً دون الحاجة لانتظار الموافقة.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
