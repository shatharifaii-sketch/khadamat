import ErrorBoundary from '@/components/ErrorBoundary';
import UserProfileQueryError from '@/components/ErrorViews/UserProfileQueryError';
import ProfileLoading from '@/components/Profile/ProfileLoading';
import ProfileView from '@/components/Profile/ProfileView';
import ProfileViewWrapper from '@/components/Profile/ProfileViewWrapper';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { usePublisherProfile } from '@/hooks/useProfile';
import { EllipsisVertical } from 'lucide-react';
import { Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';

const UserProfilePage = () => {
  const { user } = useAuth();
  const { id: userId } = useParams<{id: string}>();

  if (!userId) {
    throw new Error('User ID not found');
  };

  if (user?.id === userId) {
    return <Navigate to='/account' />;
  }

  return (
    <div className='max-w-4xl mx-auto py-12 px-4 space-y-10'>
            <Suspense fallback={<ProfileLoading />}>
            <ErrorBoundary fallback={<UserProfileQueryError />}>
                <ProfileViewWrapper userId={userId} />
            </ErrorBoundary>
        </Suspense>
    </div>
  )
}

export default UserProfilePage