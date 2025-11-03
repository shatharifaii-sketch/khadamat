
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useServices } from '@/hooks/useServices';
import PostServiceHeader from '@/components/PostService/PostServiceHeader';
import ServiceForm from '@/components/PostService/ServiceForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const PostService = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const { getUserServices } = useServices();
  const [services, setServices] = useState([]);

  const editServiceId = searchParams.get('edit');
  const isEditMode = !!editServiceId;

  useEffect(() => {
    if (isEditMode && getUserServices.data) {
      setServices(getUserServices.data);
    }
  }, [isEditMode, getUserServices.data]);
  
  const serviceToEdit = isEditMode ? services.find(service => service.id === editServiceId) : null;

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
                <h2 className="text-2xl font-bold mb-2">تسجيل الدخول مطلوب</h2>
                <p className="text-muted-foreground text-large mb-6">
                  يجب تسجيل الدخول أولاً لتتمكن من نشر خدماتك
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth" state={{ from: location }}>
                  <Button size="lg" className="w-full sm:w-auto">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    العودة للرئيسية
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Show loading while fetching service data in edit mode
  if (isEditMode && !serviceToEdit && getUserServices.isLoading) {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري تحميل بيانات الخدمة...</p>
          </div>
        </div>
    );
  }

  // Show error if service not found in edit mode
  if (isEditMode && !serviceToEdit && !getUserServices.isLoading) {
    return (

        <div className="max-w-4xl mx-auto py-12 px-4">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">الخدمة غير موجودة</h2>
                <p className="text-muted-foreground text-large mb-6">
                  لم يتم العثور على الخدمة المطلوبة
                </p>
              </div>
              <Link to="/account">
                <Button size="lg">
                  العودة لحسابي
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <PostServiceHeader isEditMode={isEditMode}>
          
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">تعديل الخدمة</h3>
              <p className="text-blue-700">
                تقوم بتعديل خدمة: <span className="font-medium">{serviceToEdit?.title}</span>
              </p>
            </div>
          )}
        </PostServiceHeader>

        <ServiceForm serviceToEdit={isEditMode ? serviceToEdit : null} />
      </div>
  );
};

export default PostService;
