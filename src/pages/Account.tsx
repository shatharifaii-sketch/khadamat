
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Lock, LogIn, UserPlus, CreditCard, Shield } from 'lucide-react';
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would authenticate with backend
    setIsLoggedIn(true);
    console.log('Login attempt:', loginData);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }
    // In real app, this would create account
    setIsLoggedIn(true);
    console.log('Signup attempt:', signupData);
  };

  const handleGoogleAuth = () => {
    // In real app, this would handle Google OAuth
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
        
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              حسابي
            </h1>
            <p className="text-xl text-muted-foreground">
              مرحباً بك في لوحة التحكم الخاصة بك
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User size={24} />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-large font-semibold">الاسم الكامل</Label>
                  <Input value="أحمد محمد" className="text-large mt-2" />
                </div>
                <div>
                  <Label className="text-large font-semibold">البريد الإلكتروني</Label>
                  <Input value="ahmed@example.com" className="text-large mt-2" />
                </div>
                <div>
                  <Label className="text-large font-semibold">رقم الهاتف</Label>
                  <Input value="0599123456" className="text-large mt-2" />
                </div>
                <Button className="w-full text-large">
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard size={24} />
                  حالة الاشتراك
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-large font-semibold">النوع:</span>
                    <span className="text-primary font-bold">مقدم خدمة</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-large font-semibold">الاشتراك:</span>
                    <span className="text-green-600 font-bold">نشط</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-large font-semibold">التجديد:</span>
                    <span className="text-large">15 يناير 2025</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full text-large">
                    إدارة الاشتراك
                  </Button>
                  <Button variant="outline" className="w-full text-large">
                    تاريخ الدفعات
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* My Services */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">خدماتي المنشورة</CardTitle>
                <CardDescription className="text-large">
                  إدارة وتعديل الخدمات التي تقدمها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-semibold">تصوير الأفراح والمناسبات</h4>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">تعديل</Button>
                        <Button size="sm" variant="destructive">حذف</Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-large mb-2">
                      تصوير احترافي للأفراح والمناسبات الخاصة مع خبرة 7 سنوات
                    </p>
                    <div className="flex items-center gap-4 text-large">
                      <span className="text-primary font-semibold">300-600 شيكل</span>
                      <span className="text-muted-foreground">رام الله</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">نشط</span>
                    </div>
                  </div>
                  
                  <Button className="w-full text-large" size="lg">
                    إضافة خدمة جديدة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logout */}
          <div className="text-center mt-8">
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="lg"
              className="text-large"
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
