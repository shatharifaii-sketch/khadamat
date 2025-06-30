
import { Users, Briefcase, TrendingUp } from 'lucide-react';

interface StatsSectionProps {
  serviceProvidersCount: number;
  publishedServicesCount: number;
  isLoading: boolean;
}

const StatsSection = ({ serviceProvidersCount, publishedServicesCount, isLoading }: StatsSectionProps) => {
  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="text-center animate-pulse">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4"></div>
                <div className="h-8 bg-muted rounded mx-auto mb-2 w-20"></div>
                <div className="h-6 bg-muted rounded mx-auto w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const stats = [
    { 
      icon: Users, 
      value: serviceProvidersCount.toString(), 
      label: 'مقدم خدمة' 
    },
    { 
      icon: Briefcase, 
      value: publishedServicesCount.toString(), 
      label: 'خدمة متاحة' 
    },
  ];

  // Show encouraging message if numbers are low
  const showEncouragingMessage = serviceProvidersCount < 10 && publishedServicesCount < 20;

  return (
    <section className="py-16 px-4 bg-card">
      <div className="max-w-6xl mx-auto">
        {showEncouragingMessage && (
          <div className="text-center mb-8">
            <TrendingUp size={32} className="text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              منصة جديدة في نمو مستمر
            </h3>
            <p className="text-muted-foreground">
              انضم إلينا في بداية رحلتنا وكن جزءاً من مجتمع الخدمات المهنية
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Icon size={32} className="text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.value === '0' ? 'قريباً' : `${stat.value}+`}
                </div>
                <div className="text-large text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
