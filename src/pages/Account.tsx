
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Settings, Plus, Eye } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useServices } from '@/hooks/useServices';

const Account = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { getUserServices } = useServices();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userServices = getUserServices.data || [];

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">حسابي</h1>
          <p className="text-muted-foreground">إدارة ملفك الشخصي وخدماتك</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-primary" />
                </div>
                <CardTitle className="text-xl">{profile?.full_name || 'المستخدم'}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail size={16} />
                  {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span>انضم في {new Date(user.created_at || '').toLocaleDateString('ar-SA')}</span>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <Settings size={16} className="ml-2" />
                    تعديل الملف الشخصي
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    size="sm"
                    onClick={handleSignOut}
                  >
                    تسجيل الخروج
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Section */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>خدماتي</CardTitle>
                    <CardDescription>
                      الخدمات التي قمت بنشرها ({userServices.length})
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate('/post-service')}>
                    <Plus size={16} className="ml-2" />
                    إضافة خدمة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userServices.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">لا توجد خدمات بعد</h3>
                    <p className="text-muted-foreground mb-4">
                      ابدأ بنشر خدمتك الأولى واحصل على عملاء جدد
                    </p>
                    <Button onClick={() => navigate('/post-service')}>
                      انشر خدمتك الأولى
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userServices.map((service: any) => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg">{service.title}</h3>
                          <Badge variant={service.status === 'published' ? 'default' : 'secondary'}>
                            {service.status === 'published' ? 'منشور' : 'مسودة'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{service.price_range}</span>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye size={14} />
                              {service.views}
                            </span>
                            <span>{service.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
