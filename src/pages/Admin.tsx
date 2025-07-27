
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  Mail,
  CheckCircle,
  Activity,
  BarChart3,
  Edit,
  XCircle,
  Shield,
  Search,
  TrendingUp
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { ServiceEditModal } from '@/components/Admin/ServiceEditModal';
import { UserManagement } from '@/components/Admin/UserManagement';
import { ServiceManagement } from '@/components/Admin/ServiceManagement';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';


interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  location?: string;
  bio?: string;
  is_service_provider: boolean;
  created_at: string;
  profile_image_url?: string;
  experience_years?: number;
}

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  experience?: string;
  views: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { analyticsSummary } = useAdminAnalytics();
  
  // Admin check - in a real app, you'd check this from the database
  const isAdmin = user?.email === 'shatharifaii@gmail.com';
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
      setupRealTimeSubscriptions();
    }
  }, [isAdmin]);

  const setupRealTimeSubscriptions = () => {
    // Real-time subscription for new users
    const profilesChannel = supabase
      .channel('profiles-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('New user registered:', payload.new);
          toast({
            title: "مستخدم جديد",
            description: `انضم ${payload.new.full_name || 'مستخدم جديد'} للموقع`,
          });
          loadAdminData(); // Refresh data
        }
      )
      .subscribe();

    // Real-time subscription for new services
    const servicesChannel = supabase
      .channel('services-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'services' },
        (payload) => {
          console.log('New service posted:', payload.new);
          toast({
            title: "خدمة جديدة",
            description: `تم إضافة خدمة جديدة: ${payload.new.title}`,
          });
          loadAdminData(); // Refresh data
        }
      )
      .subscribe();


    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(servicesChannel);
    };
  };

  const loadAdminData = async () => {
    try {
      // Load users - fallback to profiles table since we don't have service_role access
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profiles) setUsers(profiles);

      // Load services with user profiles
      const { data: servicesList } = await supabase
        .from('services')
        .select(`
          *,
          profiles (full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (servicesList) setServices(servicesList);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const updateServiceStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setServices(prev => 
        prev.map(service => 
          service.id === id ? { ...service, status } : service
        )
      );

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الخدمة بنجاح",
      });
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الخدمة",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const handleServiceUpdated = () => {
    loadAdminData(); // Reload data after service update
    // Invalidate React Query cache to reflect changes on the main website
    queryClient.invalidateQueries({ queryKey: ['public-services'] });
    queryClient.invalidateQueries({ queryKey: ['user-services'] });
    queryClient.invalidateQueries({ queryKey: ['home-stats'] });
  };

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            غير مصرح لك بالوصول لهذه الصفحة
          </h1>
          <p className="text-muted-foreground">
            هذه الصفحة مخصصة للمديرين فقط
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-6xl mx-auto py-12 px-4 text-center">
          <p className="text-xl text-muted-foreground">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Calculate accurate metrics
  const uniqueServiceProviders = new Set(
    services
      .filter(service => service.status === 'published')
      .map(service => service.user_id)
  ).size;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySignups = users.filter(user => 
    new Date(user.created_at) >= todayStart
  ).length;

  const stats = {
    totalUsers: users.length,
    serviceProviders: uniqueServiceProviders,
    totalServices: services.length,
    publishedServices: services.filter(s => s.status === 'published').length,
    todaySignups: todaySignups
  };

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            لوحة التحكم الإدارية
          </h1>
          <p className="text-muted-foreground text-lg">
            إدارة شاملة للمنصة ومراقبة الأداء
          </p>
        </div>

        {/* Simple Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي الخدمات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">الخدمات المنشورة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedServices}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">المنضمين اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaySignups}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              التحليلات
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              الخدمات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات المستخدمين</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي المستخدمين:</span>
                    <span className="font-bold">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مقدمي الخدمات:</span>
                    <span className="font-bold">{stats.serviceProviders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المنضمين اليوم:</span>
                    <span className="font-bold">{stats.todaySignups}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات الخدمات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي الخدمات:</span>
                    <span className="font-bold">{stats.totalServices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الخدمات المنشورة:</span>
                    <span className="font-bold">{stats.publishedServices}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    أكثر الكلمات بحثاً
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsSummary?.topSearchTerms && analyticsSummary.topSearchTerms.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsSummary.topSearchTerms.slice(0, 5).map((term, index) => (
                        <div key={term.query} className="flex justify-between items-center">
                          <span className="font-medium">#{index + 1} {term.query}</span>
                          <Badge variant="secondary">{term.count} مرة</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">لا توجد عمليات بحث بعد</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    أكثر الخدمات نقراً
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsSummary?.topViewedServices && analyticsSummary.topViewedServices.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsSummary.topViewedServices.slice(0, 5).map((service, index) => (
                        <div key={service.service_id} className="flex justify-between items-center">
                          <span className="font-medium truncate">#{index + 1} {service.title}</span>
                          <Badge variant="secondary">{service.views} مشاهدة</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">لا توجد مشاهدات بعد</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement users={users} onUserUpdated={loadAdminData} />
          </TabsContent>

          <TabsContent value="services">
            <ServiceManagement 
              services={services} 
              users={users}
              onServiceUpdated={handleServiceUpdated} 
            />
          </TabsContent>
        </Tabs>

        {/* Service Edit Modal */}
        <ServiceEditModal 
          service={selectedService}
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setSelectedService(null);
          }}
          onServiceUpdated={handleServiceUpdated}
        />
      </div>
    </div>
  );
};

export default Admin;
