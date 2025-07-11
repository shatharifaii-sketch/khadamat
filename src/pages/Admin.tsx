import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

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
  is_service_provider: boolean;
  created_at: string;
}

interface Service {
  id: string;
  title: string;
  category: string;
  status: string;
  price_range: string;
  location: string;
  views: number;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Admin check - in a real app, you'd check this from the database
  const isAdmin = user?.email === 'shatharifaii@gmail.com';
  
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

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

      // Load services
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

  const stats = {
    totalUsers: users.length,
    serviceProviders: users.filter(u => u.is_service_provider).length,
    totalServices: services.length,
    publishedServices: services.filter(s => s.status === 'published').length,
    pendingContacts: contactSubmissions.filter(c => c.status === 'new').length
  };

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            لوحة التحكم الإدارية
          </h1>
          <p className="text-muted-foreground">
            إدارة شاملة لموقع خدماتي
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">مقدمي الخدمات</p>
                  <p className="text-3xl font-bold">{stats.serviceProviders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الخدمات</p>
                  <p className="text-3xl font-bold">{stats.totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">خدمات منشورة</p>
                  <p className="text-3xl font-bold">{stats.publishedServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">رسائل جديدة</p>
                  <p className="text-3xl font-bold">{stats.pendingContacts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              الرسائل
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              الخدمات
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              التحليلات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  رسائل التواصل
                </CardTitle>
                <CardDescription>
                  إدارة الرسائل الواردة من نموذج التواصل
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

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  إدارة المستخدمين
                </CardTitle>
                <CardDescription>
                  عرض وإدارة جميع المستخدمين المسجلين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الموقع</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'غير محدد'}
                        </TableCell>
                        <TableCell>{user.location || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.is_service_provider ? 'default' : 'secondary'}>
                            {user.is_service_provider ? 'مقدم خدمة' : 'عميل'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  إدارة الخدمات
                </CardTitle>
                <CardDescription>
                  عرض وإدارة جميع الخدمات المنشورة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>مقدم الخدمة</TableHead>
                      <TableHead>النطاق السعري</TableHead>
                      <TableHead>المشاهدات</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {service.title}
                        </TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell>{service.profiles?.full_name || 'غير محدد'}</TableCell>
                        <TableCell>{service.price_range}</TableCell>
                        <TableCell>{service.views}</TableCell>
                        <TableCell>
                          <Badge variant={service.status === 'published' ? 'default' : 'secondary'}>
                            {service.status === 'published' ? 'منشور' : service.status === 'draft' ? 'مسودة' : 'معطل'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {service.status !== 'published' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateServiceStatus(service.id, 'published')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {service.status === 'published' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateServiceStatus(service.id, 'disabled')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    إحصائيات عامة
                  </CardTitle>
                  <CardDescription>
                    نظرة شاملة على أداء الموقع
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500 mb-2">
                        {services.reduce((sum, service) => sum + service.views, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">إجمالي المشاهدات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500 mb-2">
                        {Math.round((stats.publishedServices / stats.totalServices) * 100) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">معدل نشر الخدمات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-500 mb-2">
                        {Math.round((stats.serviceProviders / stats.totalUsers) * 100) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">نسبة مقدمي الخدمات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-500 mb-2">
                        {Math.round(services.reduce((sum, service) => sum + service.views, 0) / services.length) || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">متوسط المشاهدات</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;