
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Music, Wrench, Truck, Palette, TrendingUp, Code, Shirt, Printer, Briefcase, Baby, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '../FindService/ServiceCategories';
import { useTranslation } from 'react-i18next';

interface ServicesGridProps {
  categoriesWithServices: Array<{
    category: string;
    count: number;
  }>;
  isLoading: boolean;
}

const ServicesGrid = ({ categoriesWithServices, isLoading }: ServicesGridProps) => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";
  // // Icon mapping for different service categories
  // const categoryIcons: Record<string, any> = {
  //   'photography': Camera,
  //   'digital-marketing': TrendingUp,
  //   'web-development': Code,
  //   'graphic-design': Palette,
  //   'plumbing': Wrench,
  //   'transportation': Truck,
  //   'music': Music,
  //   'tailoring': Shirt,
  //   'printing': Printer,
  //   'nanny': Baby,
  //   'other': MoreHorizontal,
  // };

  // // Arabic translations for categories
  // const categoryTranslations: Record<string, string> = {
  //   'photography': 'التصوير الفوتوغرافي',
  //   'digital-marketing': 'التسويق الرقمي',
  //   'web-development': 'تطوير المواقع',
  //   'graphic-design': 'التصميم الجرافيكي',
  //   'plumbing': 'السباكة',
  //   'transportation': 'النقل والشحن',
  //   'music': 'الموسيقى',
  //   'tailoring': 'التطريز',
  //   'printing': 'خدمات الطباعة',
  //   'nanny': 'مربية أطفال',
  //   'other': 'أخرى',
  // };

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("services.available_services")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("services.loading_services")}
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
              {t("services.available_services")}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("services.no_services_starting")}
            </p>
            <div className="bg-muted/50 rounded-lg p-8">
              <Briefcase size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-large text-muted-foreground">
                {t("services.no_services_description")}
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
            {t("services.title")}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("services.description")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithServices.map((service, index) => {
            const Icon = categories.find(cat => cat.value === service.category)?.icon || MoreHorizontal;
            const displayName = categories.find(cat => cat.value === service.category)?.label || service.category;
            
            return (
              <Link key={index} to={`/find-service?category=${service.category}`} dir={lang === "ar" ? "rtl" : "ltr"}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                      <Icon size={32} className="text-primary" />
                    </div>
                    <CardTitle className="text-xl">{t(displayName)}</CardTitle>
                    <CardDescription className="text-large">
                      {t(service.count > 1 ? "services.service_count" : "services.service_count_single", { count: service.count })}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
