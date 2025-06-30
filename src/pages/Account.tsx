
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Settings, CreditCard, MessageCircle, TrendingUp, Eye, Calendar, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useServices } from '@/hooks/useServices';
import { useSubscription } from '@/hooks/useSubscription';
import { useProviderConversations } from '@/hooks/useProviderConversations';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Account = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { profile, updateProfile, isLoading: profileLoading } = useProfile();
  const { getUserServices } = useServices();
  const { getUserSubscription } = useSubscription();
  const { data: providerConversations = [] } = useProviderConversations();
  const { data: unreadCount = 0 } = useUnreadMessages();
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    phone: '',
    is_service_provider: false,
    experience_years: 0
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Get services and subscription data
  const { data: services = [], isLoading: servicesLoading } = getUserServices;
  const { data: subscription } = getUserSubscription;

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        is_service_provider: profile.is_service_provider || false,
        experience_years: profile.experience_years || 0
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
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

  const totalViews = services?.reduce((sum, service) => sum + service.views, 0) || 0;
  const activeServices = services?.filter(service => service.status === 'published').length || 0;

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

        <div className="grid gap-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews}</div>
                <p className="text-xs text-muted-foreground">
                  لجميع خدماتك
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المحادثات</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{providerConversations.length}</div>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 && `${unreadCount} غير مقروءة`}
                </p>
              </CardContent>
            </Card>

            <Card>
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/post-service">
                  <Button className="w-full">
                    <TrendingUp className="h-4 w-4 ml-2" />
                    أضف خدمة جديدة
                  </Button>
                </Link>
                <Link to="/provider-inbox">
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 ml-2" />
                    رسائل العملاء
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="mr-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/payment">
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 ml-2" />
                    تجديد الاشتراك
                  </Button>
                </Link>
                <Link to="/inbox">
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 ml-2" />
                    رسائلي
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
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

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_service_provider">أنا مقدم خدمة</Label>
                      <div className="text-sm text-muted-foreground">
                        فعل هذا الخيار إذا كنت تريد تقديم خدمات للآخرين
                      </div>
                    </div>
                    <Switch
                      id="is_service_provider"
                      checked={formData.is_service_provider}
                      onCheckedChange={(checked) => handleInputChange('is_service_provider', checked)}
                    />
                  </div>

                  {formData.is_service_provider && (
                    <div className="space-y-2">
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
                  )}
                </div>

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
    </div>
  );
};

export default Account;
