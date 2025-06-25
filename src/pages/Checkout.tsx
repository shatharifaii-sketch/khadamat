
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceData = location.state?.serviceData;

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    alert('تم الدفع بنجاح! سيتم نشر خدمتك خلال 24 ساعة.');
    navigate('/');
  };

  const handleGoBack = () => {
    navigate('/post-service', { state: { serviceData } });
  };

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            إتمام الاشتراك
          </h1>
          <p className="text-xl text-muted-foreground">
            أكمل عملية الدفع لنشر خدمتك
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                <CheckCircle className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold text-lg">اشتراك شهري</h3>
                  <p className="text-muted-foreground">نشر خدمات غير محدود</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>الاشتراك الشهري</span>
                  <span>10.00 شيكل</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>ضريبة القيمة المضافة</span>
                  <span>1.60 شيكل</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>المجموع</span>
                  <span>11.60 شيكل</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">يشمل الاشتراك:</h4>
                <ul className="text-green-700 space-y-1">
                  <li>• نشر خدمات غير محدودة</li>
                  <li>• تواصل مباشر مع العملاء</li>
                  <li>• إظهار متقدم في البحث</li>
                  <li>• دعم فني على مدار الساعة</li>
                </ul>
              </div>

              {serviceData && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">خدمتك المراد نشرها:</h4>
                  <p className="text-muted-foreground">{serviceData.title}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">معلومات الدفع</CardTitle>
              <CardDescription>
                أدخل معلومات بطاقتك الائتمانية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cardholderName" className="text-large font-semibold">اسم حامل البطاقة *</Label>
                  <Input
                    id="cardholderName"
                    placeholder="الاسم كما يظهر على البطاقة"
                    value={paymentData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className="text-large"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-large font-semibold">رقم البطاقة *</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="text-large pl-12"
                      required
                    />
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-large font-semibold">تاريخ الانتهاء *</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className="text-large"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-large font-semibold">CVV *</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      className="text-large"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Button type="submit" size="lg" className="w-full text-xl py-6">
                    <ArrowRight className="ml-2" size={20} />
                    إتمام الدفع (11.60 شيكل)
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    className="w-full text-xl py-6"
                    onClick={handleGoBack}
                  >
                    <ArrowLeft className="ml-2" size={20} />
                    العودة لتعديل الخدمة
                  </Button>
                </div>

                <p className="text-center text-muted-foreground text-sm">
                  سيتم تجديد الاشتراك تلقائياً كل شهر. يمكنك إلغاء الاشتراك في أي وقت.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
