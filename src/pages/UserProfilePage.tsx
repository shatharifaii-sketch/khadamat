import ErrorBoundary from '@/components/ErrorBoundary';
import ProfileView from '@/components/Profile/ProfileView';
import ProfileViewWrapper from '@/components/Profile/ProfileViewWrapper';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { usePublisherProfile } from '@/hooks/useProfile';
import { EllipsisVertical } from 'lucide-react';
import { Suspense } from 'react';
import { useParams } from 'react-router-dom';

const UserProfilePage = () => {
  const { id: userId } = useParams<{id: string}>();

  if (!userId) {
    throw new Error('User ID not found');
  };

  return (
    <div className='max-w-4xl mx-auto py-12 px-4 space-y-10'>
            <div className="flex items-center justify-center gap-2">
              <Popover>
                  <PopoverTrigger>
                    <EllipsisVertical className='size-4 text-muted-foreground' />
                  </PopoverTrigger>
                  <PopoverContent>
                    <Button variant='ghost' className='w-full flex justify-start'>
                      ابدأ شكوى
                    </Button>
                  </PopoverContent>
                </Popover>
                <h1 className="text-4xl font-bold">
                  حساب المستخدم
                </h1>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ProfileViewWrapper userId={userId} />
            </ErrorBoundary>
        </Suspense>
    </div>
  )
}

export default UserProfilePage