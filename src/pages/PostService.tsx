
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import PostServiceHeader from '@/components/PostService/PostServiceHeader';
import SubscriptionStatusCard from '@/components/PostService/SubscriptionStatusCard';
import ServiceForm from '@/components/PostService/ServiceForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const PostService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { getUserSubscription } = useSubscription();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
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
      <div className="min-h-screen bg-background arabic">
        <Navigation />
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
      </div>
    );
  }

  const subscription = getUserSubscription.data;

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <PostServiceHeader>
          <SubscriptionStatusCard subscription={subscription} />
        </PostServiceHeader>

        <ServiceForm />
      </div>
    </div>
  );
};

export default PostService;
