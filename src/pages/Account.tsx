
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Settings, CreditCard, MessageCircle, TrendingUp, Eye, Calendar, Loader2, Search } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useServices } from '@/hooks/useServices';
import { useSubscription } from '@/hooks/useSubscription';
import { useProviderConversations } from '@/hooks/useProviderConversations';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useConversations } from '@/hooks/useConversations';
import ServiceManagementCard from '@/components/Account/ServiceManagementCard';
import SubscriptionHistoryTable from '@/components/Account/SubscriptionHistoryTable';

const Account = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { profile, updateProfile, isLoading: profileLoading } = useProfile();
  const { getUserServices } = useServices();
  const { getUserSubscription } = useSubscription();
  const { data: providerConversations = [] } = useProviderConversations();
  const { getConversations } = useConversations();
  const { data: unreadCount = 0 } = useUnreadMessages();
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    phone: '',
    experience_years: 0
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Get services and subscription data
  const { data: services = [], isLoading: servicesLoading } = getUserServices;
  const { data: subscription } = getUserSubscription;
  const clientConversations = getConversations.data || [];

  // Calculate total conversations
  const totalConversations = providerConversations.length + clientConversations.length;

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        experience_years: profile.experience_years || 0
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateProfile.mutateAsync(formData);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      toast.error('فشل في تحديث الملف الشخصي');
    } finally {
      setIsUpdating(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const activeServices = services?.filter(service => service.status === 'published').length || 0;
  const isServiceProvider = activeServices > 0;

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            حسابي
          </h1>
          <p className="text-muted-foreground">
            إدارة ملفك الشخصي وخدماتك
          </p>
        </div>

        <div className="grid gap-8">
          {/* Interactive Statistics Cards - Updated to 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => scrollToSection('my-services')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الخدمات المنشورة</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeServices}</div>
                <p className="text-xs text-muted-foreground">
                  من إجمالي {services?.length || 0} خدمة
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/messages')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المحادثات</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalConversations}</div>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 && `${unreadCount} غير مقروءة`}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => scrollToSection('subscription-history')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الاشتراك</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscription?.services_allowed || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  خدمة متاحة
                </p>
              </CardContent>
            </Card>
          </div>

          {/* My Published Services Section */}
          <div id="my-services">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      خدماتي المنشورة
                    </CardTitle>
                    <CardDescription>
                      إدارة ومتابعة أداء خدماتك
                    </CardDescription>
                  </div>
                  <Link to="/post-service">
                    <Button>
                      إضافة خدمة جديدة
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {servicesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : services && services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <ServiceManagementCard key={service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد خدمات منشورة</h3>
                    <p className="text-muted-foreground mb-4">
                      ابدأ بنشر خدمتك الأولى للوصول إلى العملاء
                    </p>
                    <Link to="/post-service">
                      <Button>
                        نشر خدمة جديدة
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscription History Section */}
          <div id="subscription-history">
            <SubscriptionHistoryTable />
          </div>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                الملف الشخصي
              </CardTitle>
              <CardDescription>
                تحديث معلوماتك الشخصية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">الاسم الكامل</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="الاسم الكامل"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="رقم الهاتف"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">الموقع</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="المدينة أو المحافظة"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">نبذة عنك</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="اكتب نبذة مختصرة عنك وخبراتك"
                    rows={3}
                  />
                </div>

                {isServiceProvider && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">مقدم خدمة</Badge>
                          <span className="text-sm text-muted-foreground">
                            تم تفعيل هذا تلقائياً لأن لديك خدمات منشورة
                          </span>
                        </div>
                        <Label htmlFor="experience_years">سنوات الخبرة</Label>
                        <Input
                          id="experience_years"
                          type="number"
                          min="0"
                          value={formData.experience_years}
                          onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                          placeholder="عدد سنوات الخبرة"
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التحديث...
                    </>
                  ) : (
                    'حفظ التغييرات'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
