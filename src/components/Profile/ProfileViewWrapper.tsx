import { usePublisherProfile } from '@/hooks/useProfile';
import ProfileView from './ProfileView';

interface Props {
    userId: string;
}

const ProfileViewWrapper = ({ userId }: Props) => {
    const { profile, services } = usePublisherProfile(userId);
  return (
    <ProfileView profile={profile} services={services} />
  )
}

export default ProfileViewWrapper