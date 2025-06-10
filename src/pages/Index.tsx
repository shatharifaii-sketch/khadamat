
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Music, Wrench, Truck, Palette, TrendingUp, Code, Shirt, Printer, Plus, Search, Star, Users, CheckCircle, Home } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Index = () => {
  const services = [
    { icon: Camera, name: 'التصوير الفوتوغرافي', count: '45+ خدمة' },
    { icon: Music, name: 'دي جي', count: '23+ خدمة' },
    { icon: Wrench, name: 'السباكة', count: '67+ خدمة' },
    { icon: Truck, name: 'النقل والشحن', count: '34+ خدمة' },
    { icon: Palette, name: 'التصميم الجرافيكي', count: '89+ خدمة' },
    { icon: TrendingUp, name: 'التسويق الرقمي', count: '56+ خدمة' },
    { icon: Code, name: 'تطوير المواقع', count: '72+ خدمة' },
    { icon: Shirt, name: 'التطريز', count: '28+ خدمة' },
    { icon: Printer, name: 'خدمات الطباعة', count: '41+ خدمة' },
  ];

  const stats = [
    { icon: Users, value: '2,500+', label: 'مقدم خدمة' },
    { icon: CheckCircle, value: '15,000+', label: 'خدمة مكتملة' },
    { icon: Star, value: '4.9', label: 'تقييم متوسط' },
  ];

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-accent/30 to-primary/10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            ابحث عن الخدمة المناسبة
            <span className="text-primary block mt-2">في مكان واحد</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            منصة تربط بين مقدمي الخدمات المحترفين والأشخاص الباحثين عن الخدمات بطريقة سهلة وآمنة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/find-service">
              <Button size="lg" className="text-xl py-6 px-8 flex items-center gap-3">
                <Search size={24} />
                ابحث عن خدمة
              </Button>
            </Link>
            <Link to="/post-service">
              <Button variant="outline" size="lg" className="text-xl py-6 px-8 flex items-center gap-3">
                <Plus size={24} />
                انشر خدمتك
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Icon size={32} className="text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-large text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              الخدمات المتاحة
            </h2>
            <p className="text-xl text-muted-foreground">
              اكتشف مجموعة واسعة من الخدمات المهنية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                      <Icon size={32} className="text-primary" />
                    </div>
                    <CardTitle className="text-xl-large">{service.name}</CardTitle>
                    <CardDescription className="text-large">{service.count}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              كيف يعمل الموقع؟
            </h2>
            <p className="text-xl text-muted-foreground">
              خطوات بسيطة للحصول على الخدمة المطلوبة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Service Seekers */}
            <Card className="p-8">
              <CardHeader className="text-center">
                <Search size={48} className="text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl mb-4">للباحثين عن الخدمات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1">سجل حساباً جديداً</h4>
                      <p className="text-muted-foreground">إنشاء حساب مجاني بالإيميل أو Gmail</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1">ابحث عن الخدمة</h4>
                      <p className="text-muted-foreground">تصفح الخدمات المتاحة واختر المناسب</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1">تواصل مباشرة</h4>
                      <p className="text-muted-foreground">تواصل مع مقدم الخدمة واتفق على التفاصيل</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Service Providers */}
            <Card className="p-8">
              <CardHeader className="text-center">
                <Plus size={48} className="text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl mb-4">لمقدمي الخدمات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1">سجل واشترك</h4>
                      <p className="text-muted-foreground">إنشاء حساب والاشتراك الشهري (10 شيكل)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1">انشر خدمتك</h4>
                      <p className="text-muted-foreground">أضف تفاصيل خدمتك وأعمالك السابقة</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1">ابدأ العمل</h4>
                      <p className="text-muted-foreground">احصل على طلبات واكسب المال</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-xl-large mb-8 opacity-90">
            انضم إلى آلاف الأشخاص الذين يستخدمون خدمتك يومياً
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/post-service">
              <Button size="lg" variant="secondary" className="text-xl py-6 px-8">
                ابدأ تقديم الخدمات
              </Button>
            </Link>
            <Link to="/find-service">
              <Button size="lg" variant="outline" className="text-xl py-6 px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                ابحث عن خدمة الآن
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home size={24} />
            </div>
            <span className="text-2xl font-bold text-primary">خدمتك</span>
          </div>
          <p className="text-muted-foreground text-large mb-6">
            منصتك الأولى للخدمات المهنية في فلسطين
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-large">
            <Link to="/about" className="text-muted-foreground hover:text-primary">من نحن</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary">تواصل معنا</Link>
            <Link to="/account" className="text-muted-foreground hover:text-primary">حسابي</Link>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-muted-foreground">
            © 2024 خدمتك. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
