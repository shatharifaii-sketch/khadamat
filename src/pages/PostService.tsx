
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PostServiceHeader from '@/components/PostService/PostServiceHeader';
import ServiceForm from '@/components/PostService/ServiceForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useServiceToEditData } from '@/hooks/usePublicServices';
import { useTranslation } from 'react-i18next';

const PostService = () => {
  const { t } = useTranslation("services");
  const lang = localStorage.getItem("language") || "en";
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editServiceId = searchParams.get('edit');
  const { user, loading } = useAuth();
  const {service} = editServiceId ? useServiceToEditData(editServiceId ?? '') : { service: null };

  const isEditMode = !!editServiceId;
  

  // Wait for auth to load
  if (loading) {
    return (
      <div className="min-h-screen bg-background arabic">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <LogIn size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("post_service.no_user_title")}</h2>
                <p className="text-muted-foreground text-large mb-6">
                  {t("post_service.no_user_message")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth" state={{ from: location }}>
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("post_service.sign_in")}
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {t("post_service.back_to_home")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Show loading while fetching service data in edit mode
  if (isEditMode && !service) {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t("post_service.service_loading")}</p>
          </div>
        </div>
    );
  }

  // Show error if service not found in edit mode
  if (isEditMode && !service) {
    return (

        <div className="max-w-4xl mx-auto py-12 px-4">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("post_service.service_not_found")}</h2>
                <p className="text-muted-foreground text-large mb-6">
                  {t("post_service.service_not_found_message")}
                </p>
              </div>
              <Link to="/account">
                <Button size="lg">
                  {t("post_service.back_to_home")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto py-12 px-4" dir={lang === "ar" ? "rtl" : "ltr"}>
        <PostServiceHeader isEditMode={isEditMode}>
          
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">{t("post_service.edit_service_title")}</h3>
              <p className="text-blue-700">
                {t("post_service.editing_service")} <span className="font-medium">{service?.title}</span>
              </p>
            </div>
          )}
        </PostServiceHeader>

        <ServiceForm serviceToEdit={isEditMode ? service : null} />
      </div>
  );
};

export default PostService;
