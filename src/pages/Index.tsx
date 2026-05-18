import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

import { useHomeStats } from '@/hooks/useHomeStats';
import StatsSection from '@/components/Home/StatsSection';
import ServicesGrid from '@/components/Home/ServicesGrid';
import { useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useSubscription } from '@/hooks/useSubscription';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";
  const { data: homeStats, isLoading, error } = useHomeStats();
  const { user } = useAuth();
  const { canPost } = useSubscription();
  const SubscriptionModal = React.lazy(() => import('@/components/PostService/SubscriptionsModal'));

  if (error) {
    console.error('Error loading home stats:', error);
  }

  useEffect(() => {
    import('@/components/PostService/SubscriptionsModal');
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-accent/30 to-primary/10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t("hero.title")}
            <span className="text-primary block mt-2">{t("hero.subtitle")}</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/find-service">
              <Button size="lg" className="text-xl py-6 px-8 flex items-center gap-3">
                <Search size={24} />
                {t("hero.find_service")}
              </Button>
            </Link>
            <Link to="/post-service">
              <Button variant="outline" size="lg" className="text-xl py-6 px-8 flex items-center gap-3">
                <Plus size={24} />
                {t("hero.post_service")}
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
          <div className="text-center mb-12" dir={lang === "ar" ? "rtl" : "ltr"}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("how_it_works.title")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("how_it_works.description")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12" dir={lang === "ar" ? "rtl" : "ltr"}>
            {/* For Service Seekers */}
            <Card className="p-8">
              <CardHeader className="text-center">
                <Search size={48} className="text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl mb-4">
                  {t("how_it_works.for_seekers")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4" >
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1 text-start">{t("how_it_works.step_1")}</h4>
                      <p className="text-muted-foreground text-start">
                        {t("how_it_works.step_1_desc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1 text-start">{t("how_it_works.step_2")}</h4>
                      <p className="text-muted-foreground text-start">
                        {t("how_it_works.step_2_desc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1 text-start">{t("how_it_works.step_3")}</h4>
                      <p className="text-muted-foreground text-start">
                        {t("how_it_works.step_3_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Service Providers */}
            <Card className="p-8">
              <CardHeader className="text-center">
                <Plus size={48} className="text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl mb-4">
                  {t("how_it_works.for_providers")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1 text-start">
                        {t("how_it_works.provider_step_1")}
                      </h4>
                      <p className="text-muted-foreground text-start">
                        {t("how_it_works.provider_step_1_desc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1 text-start">
                        {t("how_it_works.provider_step_2")}
                      </h4>
                      <p className="text-muted-foreground text-start">
                        {t("how_it_works.provider_step_2_desc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-large mb-1 text-start">
                        {t("how_it_works.provider_step_3")}
                      </h4>
                      <p className="text-muted-foreground text-start">
                        {t("how_it_works.provider_step_3_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {homeStats?.serviceProvidersCount && homeStats.serviceProvidersCount > 0 
              ? t("cta.subtitle_1", { count: homeStats.serviceProvidersCount })
              : t("cta.subtitle_2")
            }
          </p>
          {user && canPost ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/post-service">
              <Button size="lg" variant="secondary" className="text-xl py-6 px-8">
                {t("cta.post_service")}
              </Button>
            </Link>
            <Link to="/find-service">
              <Button size="lg" variant="outline" className="text-xl py-6 px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                {t("cta.find_service")}
              </Button>
            </Link>
          </div>
          ) : (
            <div>
              <Suspense fallback={<div>Loading...</div>}>
              <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <SubscriptionModal 
                user={user}
                cardClassName='shadow-xl'
                asDrawer={false}
                switchClassName='transition-all bg-secondary text-muted-foreground px-4 py-2 rounded-full' />
              </ErrorBoundary>
            </Suspense>
            </div>
          )}
        </div>
      </section>
      </>
  );
};

export default Index;
