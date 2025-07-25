
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
  Shield
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { ServiceEditModal } from '@/components/Admin/ServiceEditModal';
import { AnalyticsDashboard } from '@/components/Admin/AnalyticsDashboard';
import { UserManagement } from '@/components/Admin/UserManagement';
import { ServiceManagement } from '@/components/Admin/ServiceManagement';
import { RealTimeTracker } from '@/components/Admin/RealTimeTracker';
import EnhancedAnalyticsDashboard from '@/components/Admin/EnhancedAnalyticsDashboard';
import RealTimeSystemMonitor from '@/components/Admin/RealTimeSystemMonitor';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  created_at: string;
}

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
  
  // Admin check - in a real app, you'd check this from the database
  const isAdmin = user?.email === 'shatharifaii@gmail.com';
  
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
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

    // Real-time subscription for contact forms
    const contactsChannel = supabase
      .channel('contacts-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_submissions' },
        (payload) => {
          console.log('New contact form:', payload.new);
          toast({
            title: "نموذج تواصل جديد",
            description: `رسالة جديدة من ${payload.new.name}`,
          });
          loadAdminData(); // Refresh data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(contactsChannel);
    };
  };

  const loadAdminData = async () => {
    try {
      // Load contact submissions
      const { data: contacts } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (contacts) setContactSubmissions(contacts);

      // Load users
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

  const updateContactStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setContactSubmissions(prev => 
        prev.map(submission => 
          submission.id === id ? { ...submission, status } : submission
        )
      );

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الرسالة بنجاح",
      });
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحالة",
        variant: "destructive",
      });
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

  const pendingContacts = contactSubmissions.filter(c => c.status === 'new').length;

  const stats = {
    totalUsers: users.length,
    serviceProviders: uniqueServiceProviders,
    totalServices: services.length,
    publishedServices: services.filter(s => s.status === 'published').length,
    pendingContacts: pendingContacts,
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

        {/* Real-time System Monitor */}
        <div className="mb-8">
          <RealTimeSystemMonitor />
        </div>


        {/* Main Admin Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              نماذج التواصل
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <EnhancedAnalyticsDashboard />
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

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  نماذج التواصل
                </CardTitle>
                <CardDescription>
                  إدارة نماذج التواصل الواردة من العملاء (يتم إرسالها إلى البريد الإلكتروني)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>الرسالة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>{submission.phone || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {submission.message}
                        </TableCell>
                        <TableCell>
                          <Badge variant={submission.status === 'new' ? 'default' : 'secondary'}>
                            {submission.status === 'new' ? 'جديد' : 'تم الرد'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(submission.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateContactStatus(submission.id, 'replied')}
                              disabled={submission.status === 'replied'}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
