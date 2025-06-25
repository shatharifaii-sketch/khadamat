import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Mail, Lock, LogIn, UserPlus, CreditCard, Shield, Eye, MessageSquare, Edit3, Settings, BarChart3, FileText, Calendar } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Account = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    userType: 'client' // 'client' or 'provider'
  });

  // Mock data for dashboard
  const subscriptionHistory = [
    { id: 1, date: '2024-12-25', amount: '10 شيكل', plan: 'مقدم خدمة', status: 'مدفوع' },
    { id: 2, date: '2024-11-25', amount: '10 شيكل', plan: 'مقدم خدمة', status: 'مدفوع' },
    { id: 3, date: '2024-10-25', amount: '10 شيكل', plan: 'مقدم خدمة', status: 'مدفوع' },
  ];

  const services = [
    { 
      id: 1, 
      title: 'تصوير الأفراح والمناسبات', 
      status: 'منشور', 
      views: 245, 
      chats: 8, 
      price: '300-600 شيكل',
      publishedDate: '2024-12-01'
    },
    { 
      id: 2, 
      title: 'تصوير المنتجات التجارية', 
      status: 'مسودة', 
      views: 0, 
      chats: 0, 
      price: '150-300 شيكل',
      publishedDate: null
    },
    { 
      id: 3, 
      title: 'تصوير البورتريه الشخصي', 
      status: 'منشور', 
      views: 89, 
      chats: 3, 
      price: '100-200 شيكل',
      publishedDate: '2024-11-15'
    },
  ];

  const chats = [
    { id: 1, clientName: 'سارة أحمد', serviceName: 'تصوير الأفراح', lastMessage: 'هل يمكن تحديد موعد للتصوير؟', time: '10 دقائق', unread: true },
    { id: 2, clientName: 'محمد خالد', serviceName: 'تصوير الأفراح', lastMessage: 'شكراً لك، سأتواصل معك قريباً', time: '2 ساعات', unread: false },
    { id: 3, clientName: 'ليلى عثمان', serviceName: 'تصوير البورتريه', lastMessage: 'ما هي الأسعار المتاحة؟', time: '1 يوم', unread: true },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    console.log('Login attempt:', loginData);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }
    setIsLoggedIn(true);
    console.log('Signup attempt:', signupData);
  };

  const handleGoogleAuth = () => {
    setIsLoggedIn(true);
    console.log('Google authentication');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ email: '', password: '' });
    setSignupData({ name: '', email: '', password: '', confirmPassword: '', userType: 'client' });
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              لوحة التحكم
            </h1>
            <p className="text-xl text-muted-foreground">
              إدارة حسابك وخدماتك من مكان واحد
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="overview" className="text-sm">نظرة عامة</TabsTrigger>
              <TabsTrigger value="services" className="text-sm">خدماتي</TabsTrigger>
              <TabsTrigger value="chats" className="text-sm">المحادثات</TabsTrigger>
              <TabsTrigger value="subscription" className="text-sm">الاشتراك</TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm">الإحصائيات</TabsTrigger>
              <TabsTrigger value="profile" className="text-sm">الملف الشخصي</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-muted-foreground">خدمات منشورة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Eye className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">334</p>
                        <p className="text-muted-foreground">إجمالي المشاهدات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">11</p>
                        <p className="text-muted-foreground">محادثات جديدة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">نشط</p>
                        <p className="text-muted-foreground">حالة الاشتراك</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>الخدمات الأكثر مشاهدة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {services.filter(s => s.status === 'منشور').map((service) => (
                        <div key={service.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{service.title}</p>
                            <p className="text-sm text-muted-foreground">{service.price}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold">{service.views}</p>
                            <p className="text-xs text-muted-foreground">مشاهدة</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>المحادثات الأخيرة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chats.slice(0, 3).map((chat) => (
                        <div key={chat.id} className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium text-sm">{chat.clientName}</p>
                              <span className="text-xs text-muted-foreground">{chat.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{chat.lastMessage}</p>
                            {chat.unread && <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">إدارة الخدمات</h2>
                <Button>
                  <FileText className="ml-2 h-4 w-4" />
                  إضافة خدمة جديدة
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم الخدمة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>المشاهدات</TableHead>
                        <TableHead>المحادثات</TableHead>
                        <TableHead>تاريخ النشر</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.title}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              service.status === 'منشور' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {service.status}
                            </span>
                          </TableCell>
                          <TableCell>{service.price}</TableCell>
                          <TableCell>{service.views}</TableCell>
                          <TableCell>{service.chats}</TableCell>
                          <TableCell>{service.publishedDate || 'غير منشور'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
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

            {/* Chats Tab */}
            <TabsContent value="chats" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">المحادثات</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">الكل</Button>
                  <Button variant="outline" size="sm">غير مقروءة</Button>
                </div>
              </div>

              <div className="grid gap-4">
                {chats.map((chat) => (
                  <Card key={chat.id} className={chat.unread ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{chat.clientName}</h4>
                            <span className="text-sm text-muted-foreground">{chat.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{chat.serviceName}</p>
                          <p className="text-sm">{chat.lastMessage}</p>
                          {chat.unread && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-xs text-primary font-medium">رسالة جديدة</span>
                            </div>
                          )}
                        </div>
                        <Button size="sm">رد</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard size={24} />
                      حالة الاشتراك
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">النوع:</span>
                        <span className="text-primary font-bold">مقدم خدمة</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">الاشتراك:</span>
                        <span className="text-green-600 font-bold">نشط</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">التجديد:</span>
                        <span>15 يناير 2025</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button className="w-full">إدارة الاشتراك</Button>
                      <Button variant="outline" className="w-full">تغيير الخطة</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>تاريخ الدفعات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {subscriptionHistory.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <p className="font-medium">{payment.plan}</p>
                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">{payment.amount}</p>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={24} />
                    إحصائيات الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">334</p>
                      <p className="text-muted-foreground">إجمالي المشاهدات</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">11</p>
                      <p className="text-muted-foreground">المحادثات الشهر الحالي</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">67%</p>
                      <p className="text-muted-foreground">معدل التفاعل</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أداء الخدمات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.filter(s => s.status === 'منشور').map((service) => (
                      <div key={service.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{service.title}</h4>
                          <p className="text-sm text-muted-foreground">منشور في {service.publishedDate}</p>
                        </div>
                        <div className="flex gap-6 text-center">
                          <div>
                            <p className="font-bold text-primary">{service.views}</p>
                            <p className="text-xs text-muted-foreground">مشاهدة</p>
                          </div>
                          <div>
                            <p className="font-bold text-blue-600">{service.chats}</p>
                            <p className="text-xs text-muted-foreground">محادثة</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={24} />
                    تعديل الملف الشخصي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">الاسم الكامل</Label>
                      <Input defaultValue="أحمد محمد" className="mt-2" />
                    </div>
                    <div>
                      <Label className="font-semibold">البريد الإلكتروني</Label>
                      <Input defaultValue="ahmed@example.com" className="mt-2" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">رقم الهاتف</Label>
                      <Input defaultValue="0599123456" className="mt-2" />
                    </div>
                    <div>
                      <Label className="font-semibold">المدينة</Label>
                      <Input defaultValue="رام الله" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label className="font-semibold">نبذة عني</Label>
                    <Input 
                      defaultValue="مصور محترف مع خبرة 7 سنوات في تصوير الأفراح والمناسبات" 
                      className="mt-2" 
                    />
                  </div>

                  <Button className="w-full">حفظ التغييرات</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock size={24} />
                    تغيير كلمة المرور
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>كلمة المرور الحالية</Label>
                    <Input type="password" className="mt-2" />
                  </div>
                  <div>
                    <Label>كلمة المرور الجديدة</Label>
                    <Input type="password" className="mt-2" />
                  </div>
                  <div>
                    <Label>تأكيد كلمة المرور الجديدة</Label>
                    <Input type="password" className="mt-2" />
                  </div>
                  <Button className="w-full">تغيير كلمة المرور</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Logout */}
          <div className="text-center mt-8">
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="lg"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            تسجيل الدخول
          </h1>
          <p className="text-xl text-muted-foreground">
            ادخل إلى حسابك أو أنشئ حساباً جديداً
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login" className="text-large">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="signup" className="text-large">حساب جديد</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-center">تسجيل الدخول</CardTitle>
                <CardDescription className="text-large text-center">
                  ادخل بياناتك للوصول إلى حسابك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-large">البريد الإلكتروني</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="text-large"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-large">كلمة المرور</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="text-large"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full text-large" size="lg">
                    <LogIn size={18} className="ml-2" />
                    تسجيل الدخول
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-large">
                      <span className="bg-background px-2 text-muted-foreground">أو</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleGoogleAuth}
                    variant="outline" 
                    className="w-full mt-4 text-large" 
                    size="lg"
                  >
                    <Mail size={18} className="ml-2" />
                    تسجيل الدخول بـ Gmail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-center">إنشاء حساب جديد</CardTitle>
                <CardDescription className="text-large text-center">
                  املأ البيانات لإنشاء حسابك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-large">الاسم الكامل</Label>
                    <Input
                      id="signup-name"
                      placeholder="الاسم الكامل"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-large"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-large">البريد الإلكتروني</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      className="text-large"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-large">كلمة المرور</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      className="text-large"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-large">تأكيد كلمة المرور</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="text-large"
                      required
                    />
                  </div>
                  
                  {/* User Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-large">نوع الحساب</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          signupData.userType === 'client' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSignupData(prev => ({ ...prev, userType: 'client' }))}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            signupData.userType === 'client' ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`} />
                          <div>
                            <h4 className="font-semibold text-large">باحث عن خدمة</h4>
                            <p className="text-muted-foreground">حساب مجاني للبحث عن الخدمات</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          signupData.userType === 'provider' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSignupData(prev => ({ ...prev, userType: 'provider' }))}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            signupData.userType === 'provider' ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`} />
                          <div>
                            <h4 className="font-semibold text-large">مقدم خدمة</h4>
                            <p className="text-muted-foreground">اشتراك شهري 10 شيكل</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full text-large" size="lg">
                    <UserPlus size={18} className="ml-2" />
                    إنشاء الحساب
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-large">
                      <span className="bg-background px-2 text-muted-foreground">أو</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleGoogleAuth}
                    variant="outline" 
                    className="w-full mt-4 text-large" 
                    size="lg"
                  >
                    <Mail size={18} className="ml-2" />
                    التسجيل بـ Gmail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
