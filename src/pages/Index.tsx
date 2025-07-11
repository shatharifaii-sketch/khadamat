import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import Navigation from '@/components/Navigation';

import { useHomeStats } from '@/hooks/useHomeStats';
import StatsSection from '@/components/Home/StatsSection';
import ServicesGrid from '@/components/Home/ServicesGrid';

const Index = () => {
  const { data: homeStats, isLoading, error } = useHomeStats();

  if (error) {
    console.error('Error loading home stats:', error);
  }

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
      <StatsSection
        serviceProvidersCount={homeStats?.serviceProvidersCount || 0}
        publishedServicesCount={homeStats?.publishedServicesCount || 0}
        isLoading={isLoading}
      />

      {/* Services Grid */}
      <ServicesGrid
        categoriesWithServices={homeStats?.categoriesWithServices || []}
        isLoading={isLoading}
      />

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
          <p className="text-xl mb-8 opacity-90">
            {homeStats?.serviceProvidersCount && homeStats.serviceProvidersCount > 0 
              ? `انضم إلى ${homeStats.serviceProvidersCount}+ من مقدمي الخدمات المحترفين`
              : 'كن من أوائل مقدمي الخدمات على منصتنا'
            }
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

      
    </div>
  );
};

export default Index;
