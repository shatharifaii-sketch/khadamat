
import { useEffect, useRef, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, TrendingUp, Calendar, Loader2, Pen, Plus } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useServices } from '@/hooks/useServices';
import { useSubscription } from '@/hooks/useSubscription';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import ServiceManagementCard from '@/components/Account/ServiceManagementCard';
import PaymentSuccessCard from '@/components/Account/PaymentSuccessCard';
import MainUserDetails from '@/components/Account/MainUserDetails';
import UploadProfileImage from '@/components/Account/UploadProfileImage';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionsLoading from '@/components/Account/SubscriptionsLoading';
import UserSubscriptions from '@/components/Account/UserSubscriptions';
import UserTransactions from '@/components/Account/UserTransactions';
import ChangeEmailComponent from '@/components/Account/ChangeEmailComponent';
import ChangePasswordComponent from '@/components/Account/ChangePasswordComponent';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import DeleteProfileComponent from '@/components/Account/DeleteProfileComponent';
import UpdateUserDetails from '@/components/Account/UpdateUserDetails';

const Account = () => {
  const { t } = useTranslation("account");
  const lang = localStorage.getItem("language") || "en";
  const location = useLocation();
  const servicePending = location.state?.servicePending as boolean ?? false;

  useEffect(() => {
    if (servicePending) {
      toast.success(t("service_pending"));
    }
  }, [servicePending, t]);

  const isMobile = useIsMobile();
  const { user, loading } = useAuth();
  
  const navigate = useNavigate();
  const { profile, updateProfile, isLoading: profileLoading, deleteProfile, isDeleting } = useProfile();
  const { getUserServices } = useServices();
  const { getUserSubscription, getUserSubscriptions } = useSubscription();

  const cardRef = useRef<HTMLDivElement>(null);

  // Get services and subscription data
  const { data: services = [], isLoading: servicesLoading } = getUserServices;
  const { data: subscription } = getUserSubscription;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background arabic">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const activeServices = services?.filter(service => service.status === 'published').length || 0;
  const isServiceProvider = activeServices > 0;

  const scrollToEdit = () => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div>
          <MainUserDetails user={profile} />
        </div>
        <Button
          onClick={scrollToEdit}
          variant='ghost'
          className="text-muted-foreground justify-center flex items-center gap-2 hover:text-primary mx-auto">
          <Pen className='size-4' />
          <p>{t('edit_profile_button')}</p>
        </Button>
      </div>

      <div className="md:grid md:gap-8 flex flex-col gap-2">
        {/* Payment Success Notification */}
        <PaymentSuccessCard />

        {/* Interactive Statistics Cards - Updated to 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection('my-services')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('my_services')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeServices}</div>
              <p className="text-xs text-muted-foreground">
                من إجمالي {services?.length || 0} خدمة
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection('subscription-history')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('subscription')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.services_allowed || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("available_services")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Published Services Section */}
        <div id="my-services">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm text-wrap md:text-xl">
                    <TrendingUp className="h-5 w-5" />
                    {t("my_published_services")}
                  </CardTitle>
                  <CardDescription className='mt-2'>
                    {t("manage_your_services")}
                  </CardDescription>
                </div>
                <Link to={subscription?.status === 'active' ? "/post-service" : "#"}>
                  <Button disabled={subscription?.status !== 'active'}>
                    {isMobile ? <Plus className="h-4 w-4" /> : t("post_new_service")}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto bg-muted rounded-lg p-2">
                  {services.map((service) => (
                    <ServiceManagementCard key={service.id} service={service} canPost={subscription?.status === 'active'} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("no_published_services")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t("start_publishing_services")}
                  </p>
                  <Link to="/post-service">
                    <Button>
                      {t("post_new_service")}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription History Section */}
        {getUserSubscriptions.data && (
          <div>
            <Suspense fallback={<>
              <p>{t("loading_subscriptions")}</p></>}>
              <ErrorBoundary fallback={<div>{t("error_loading_subscriptions")}</div>}>
                <UserSubscriptions user={user} />
              </ErrorBoundary>
            </Suspense>
          </div>
        )}

        <div id="subscription-history">
          <Suspense fallback={<SubscriptionsLoading />}>
            <ErrorBoundary fallback={<div>{t("error_loading_transactions")}</div>}>
              {/*<SubscriptionHistoryTable /> */}
              <UserTransactions />
            </ErrorBoundary>
          </Suspense>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("account_settings")}
            </CardTitle>
            <CardDescription>
              {t("manage_account_info")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <ChangeEmailComponent user={user} />
              </div>

              <div className="space-y-2">
                <ChangePasswordComponent />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card ref={cardRef} dir={lang === "ar" ? "rtl" : "ltr"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("profile_settings")}
            </CardTitle>
            <CardDescription className="text-start">
              {t("update_profile_info")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadProfileImage userId={profile?.id} userName={profile?.full_name} userImage={profile?.profile_image_url} />
            <UpdateUserDetails
              isServiceProvider={isServiceProvider}
              profile={profile}
              rawPhone={profile?.phone}
              updateProfile={updateProfile}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <DeleteProfileComponent 
          deleteProfile={deleteProfile}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};

export default Account;
