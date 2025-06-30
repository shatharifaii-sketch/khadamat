
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import PostServiceHeader from '@/components/PostService/PostServiceHeader';
import SubscriptionStatusCard from '@/components/PostService/SubscriptionStatusCard';
import ServiceForm from '@/components/PostService/ServiceForm';

const PostService = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserSubscription } = useSubscription();

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
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
