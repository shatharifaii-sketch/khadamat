
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

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

  const paymentMethods = [
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Subscription Status */}
              {subscription && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">اشتراكك الحالي:</h4>
                  <p className="text-blue-700">
                    استخدمت {subscription.services_used} من {subscription.services_allowed} خدمات
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                <CheckCircle className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold text-lg">
                    {servicesNeeded === 2 ? 'باقة جديدة' : 'خدمات إضافية'}
                  </h3>
                  <p className="text-muted-foreground">
                    {servicesNeeded} خدمات جديدة
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>عدد الخدمات:</span>
                  <span>{servicesNeeded}</span>
                </div>
                <div className="flex justify-between">
                  <span>السعر لكل خدمة:</span>
                  <span>5 شيكل</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>المجموع:</span>
                  <span>{amount} شيكل</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">ما ستحصل عليه:</h4>
                <ul className="text-green-700 space-y-1">
                  <li>• إمكانية نشر {servicesNeeded} خدمات جديدة</li>
                  <li>• تواصل مباشر مع العملاء</li>
                  <li>• إظهار متقدم في البحث</li>
                  <li>• دعم فني</li>
                </ul>
              </div>

              {serviceData && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">الخدمة المراد نشرها:</h4>
                  <p className="text-muted-foreground">{serviceData.title}</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                <div className="space-y-4">
                  <Label className="text-large font-semibold">اختر طريقة الدفع</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
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

                <Separator />

                {/* Payment Method Specific Forms */}
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">اسم حامل البطاقة *</Label>
                      <Input
                        id="cardholderName"
                        placeholder="الاسم كما يظهر على البطاقة"
                        value={paymentData.cardholderName}
                        onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">رقم البطاقة *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
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
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'jawwal_pay' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">رقم الهاتف المحمول *</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="0599123456"
                        value={paymentData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
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
                )}

                {paymentMethod === 'reflect' && (
                  <div className="text-center p-6 border rounded-lg bg-green-50">
                    <Building2 className="mx-auto mb-4 text-green-600" size={48} />
                    <p className="text-lg mb-4">سيتم توجيهك إلى بوابة Reflect للدفع</p>
                    <p className="text-sm text-green-700">
                      بوابة الدفع الإلكتروني الفلسطينية الآمنة
                    </p>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Banknote className="text-yellow-600" size={20} />
                        <span className="font-semibold text-yellow-800">تحويل بنكي</span>
                      </div>
                      <p className="text-yellow-700 text-sm">
                        سيتم توجيهك لصفحة تفاصيل التحويل البنكي
                      </p>
                    </div>
                  </div>
                )}

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
