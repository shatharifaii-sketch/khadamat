import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, TrendingUp, Star } from 'lucide-react';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getUserSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  
  const serviceData = location.state?.serviceData;
  const subscription = getUserSubscription.data;

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handlePlanSelection = (tier: 'monthly' | 'yearly') => {
    navigate('/payment', { 
      state: { 
        serviceData, 
        subscriptionTier: tier,
        servicesNeeded: 1
      } 
    });
  };

  return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">اختر خطة الاشتراك</h1>
          <p className="text-muted-foreground text-lg">
            اختر الخطة التي تناسب احتياجاتك لنشر خدماتك والوصول إلى عملائك
          </p>
        </div>

        {serviceData && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-600" size={20} />
              <span className="font-medium text-blue-900">خدمتك المختارة</span>
            </div>
            <p className="text-blue-700">{serviceData.title}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === 'monthly' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5" />
                الخطة الشهرية
              </CardTitle>
              <div className="text-center">
                <div className="text-3xl font-bold">10 شيكل</div>
                <div className="text-muted-foreground">شهرياً</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>خدمة واحدة في الشهر</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>إدارة كاملة للخدمات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>الرد على الاستفسارات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>إحصائيات الخدمة</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
                onClick={() => handlePlanSelection('monthly')}
              >
                اختيار الخطة الشهرية
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg relative ${
              selectedPlan === 'yearly' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <Badge 
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600"
            >
              <Star className="w-3 h-3 mr-1" />
              وفر 20 شيكل!
            </Badge>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5" />
                الخطة السنوية
              </CardTitle>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">100 شيكل</div>
                <div className="text-muted-foreground">
                  سنوياً 
                  <span className="line-through text-sm mx-2">120 شيكل</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span className="font-medium">12 شهر من الخدمات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span className="font-medium">رفع تلقائي للخدمة كل شهر</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>إدارة كاملة للخدمات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>الرد على الاستفسارات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>إحصائيات متقدمة</span>
                </div>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                variant={selectedPlan === 'yearly' ? 'default' : 'outline'}
                onClick={() => handlePlanSelection('yearly')}
              >
                اختيار الخطة السنوية (الأفضل!)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Subscription Info */}
        {subscription && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">اشتراكك الحالي:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>الخدمات المتاحة: {subscription.services_allowed}</p>
              <p>الخدمات المستخدمة: {subscription.services_used}</p>
              <p>نوع الاشتراك: {subscription.billing_cycle === 'yearly' ? 'سنوي' : 'شهري'}</p>
              <p>ينتهي في: {new Date(subscription.expires_at).toLocaleDateString('ar')}</p>
            </div>
          </div>
        )}
      </div>
  );
};

export default SubscriptionPlans;