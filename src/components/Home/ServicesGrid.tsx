import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Music, Wrench, Truck, Palette, TrendingUp, Code, Shirt, Printer, Briefcase, Baby, MoreHorizontal } from 'lucide-react';

interface ServicesGridProps {
  categoriesWithServices: Array<{
    category: string;
    count: number;
  }>;
  isLoading: boolean;
}

const ServicesGrid = ({ categoriesWithServices, isLoading }: ServicesGridProps) => {
  // Icon mapping for different service categories
  const categoryIcons: Record<string, any> = {
    'photography': Camera,
    'digital-marketing': TrendingUp,
    'web-development': Code,
    'graphic-design': Palette,
    'plumbing': Wrench,
    'transportation': Truck,
    'music': Music,
    'tailoring': Shirt,
    'printing': Printer,
    'nanny': Baby,
    'other': MoreHorizontal,
  };

  // Arabic translations for categories
  const categoryTranslations: Record<string, string> = {
    'photography': 'التصوير الفوتوغرافي',
    'digital-marketing': 'التسويق الرقمي',
    'web-development': 'تطوير المواقع',
    'graphic-design': 'التصميم الجرافيكي',
    'plumbing': 'السباكة',
    'transportation': 'النقل والشحن',
    'music': 'الموسيقى',
    'tailoring': 'التطريز',
    'printing': 'خدمات الطباعة',
    'nanny': 'مربية أطفال',
    'other': 'أخرى',
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              الخدمات المتاحة
            </h2>
            <p className="text-xl text-muted-foreground">
              جاري تحميل الخدمات...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-muted rounded mx-auto mb-2 w-3/4"></div>
                  <div className="h-4 bg-muted rounded mx-auto w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categoriesWithServices.length === 0) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              الخدمات المتاحة
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              نحن في بداية رحلتنا ونبحث عن مقدمي خدمات محترفين للانضمام إلينا
            </p>
            <div className="bg-muted/50 rounded-lg p-8">
              <Briefcase size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-large text-muted-foreground">
                كن من أوائل مقدمي الخدمات على منصتنا واحصل على فرصة أكبر للوصول للعملاء
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            الخدمات المتاحة
          </h2>
          <p className="text-xl text-muted-foreground">
            اكتشف الخدمات المهنية المتاحة حالياً
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithServices.map((service, index) => {
            const Icon = categoryIcons[service.category] || Briefcase;
            const displayName = categoryTranslations[service.category] || service.category;
            
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Icon size={32} className="text-primary" />
                  </div>
                  <CardTitle className="text-xl">{displayName}</CardTitle>
                  <CardDescription className="text-large">
                    {service.count} {service.count === 1 ? 'خدمة' : 'خدمة'}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
