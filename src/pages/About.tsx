
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart, Shield, Award, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useHomeStats } from '@/hooks/useHomeStats';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation("about");
  const lang = localStorage.getItem("language") || "en";
  const { data: homeStats, isLoading, error } = useHomeStats();

  const features = [
    {
      icon: Shield,
      title: t("about.features.security.title"),
      description: t("about.features.security.description")
    },
    {
      icon: Users,
      title: t("about.features.network.title"),
      description: t("about.features.network.description")
    },
    {
      icon: CheckCircle,
      title: t("about.features.ease.title"),
      description: t("about.features.ease.description")
    }
  ];

  // Create dynamic stats based on real data
  const getDynamicStats = () => {
    if (isLoading) {
      return [
        { number: '...', label: t("about.stats.service_provider") },
        { number: '...', label: t("about.stats.available_service") },
        { number: '...', label: t("about.stats.service_category") },
      ];
    }

    const serviceProvidersCount = homeStats?.serviceProvidersCount || 0;
    const publishedServicesCount = homeStats?.publishedServicesCount || 0;
    const categoriesCount = homeStats?.categoriesWithServices?.length || 0;

    // Show encouraging message for new platform
    const isNewPlatform = serviceProvidersCount < 10 && publishedServicesCount < 20;

    return [
      { 
        number: serviceProvidersCount === 0 ? t("about.stats.coming_soon") : `${serviceProvidersCount}+`, 
        label: t("about.stats.service_provider") 
      },
      { 
        number: publishedServicesCount === 0 ? t("about.stats.coming_soon") : `${publishedServicesCount}+`, 
        label: t("about.stats.available_service") 
      },
      { 
        number: categoriesCount === 0 ? t("about.stats.coming_soon") : `${categoriesCount}+`, 
        label: t("about.stats.service_category")
      },
    ];
  };

  const stats = getDynamicStats();
  const isNewPlatform = !isLoading && (homeStats?.serviceProvidersCount || 0) < 10 && (homeStats?.publishedServicesCount || 0) < 20;

  return (
      <div className="max-w-6xl mx-auto py-12 px-4" dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("about.hero.title")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            {t("about.hero.description")}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Target className="text-primary" size={32} />
                {t("about.mission.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl-large text-muted-foreground text-start">
                {t("about.mission.description")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Heart className="text-primary" size={32} />
                {t("about.vision.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl-large text-muted-foreground text-start">
                {t("about.vision.description")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-card py-16 px-8 rounded-lg mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {isNewPlatform ? t("about.stats.new_platform_title") : t("about.stats.stats_title")}
          </h2>
          
          {isNewPlatform && (
            <p className="text-center text-muted-foreground mb-8 text-large">
              {t("about.stats.new_platform_description")}
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-large text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.features.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Icon size={32} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-start">{feature.title}</h3>
                      <p className="text-large text-muted-foreground text-start">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Our Story */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {t("about.story.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xl-large text-muted-foreground text-start">
              {t("about.story.paragraph_1")}
            </p>
            <p className="text-xl-large text-muted-foreground text-start">
             {t("about.story.paragraph_2")}
            </p>
            <p className="text-xl-large text-muted-foreground text-start">
              {isNewPlatform 
                ? t("about.story.new_platform_paragraph")
                : t("about.story.existing_platform_paragraph")
              }
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">
            {t("about.values.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("about.values.trust.title")}
              </h3>
              <p className="text-large text-muted-foreground">
                {t("about.values.trust.description")}
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("about.values.innovation.title")}
              </h3>
              <p className="text-large text-muted-foreground">
                {t("about.values.innovation.description")}
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("about.values.communication.title")}
              </h3>
              <p className="text-large text-muted-foreground">
                {t("about.values.communication.description")}
              </p>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default About;
