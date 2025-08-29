import ErrorBoundary from '@/components/ErrorBoundary';
import ProfileView from '@/components/Profile/ProfileView';
import { usePublisherProfile } from '@/hooks/useProfile';
import { Suspense } from 'react';
import { useParams } from 'react-router-dom';

const UserProfilePage = () => {
  const { id: userId } = useParams<{id: string}>();

  if (!userId) {
    throw new Error('User ID not found');
  };

  const { data: userProfile } = usePublisherProfile(userId);

  return (
    <div className='max-w-4xl mx-auto py-12 px-4 space-y-10'>
            <div className="flex items-center justify-center">
                <h1 className="text-4xl font-bold">
                  حساب المستخدم
                </h1>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ProfileView profile={userProfile} />
            </ErrorBoundary>
        </Suspense>
    </div>
  )
}

export default UserProfilePage