import React, { useState } from 'react'
import ProfileHeader from './ui/ProfileHeader';
import { Tables } from '@/integrations/supabase/types';
import ProfileDataCard from './ui/ProfileDataCard';
import ContactOptions from '../Chat/ui/ContactOptions';
import ReportDrawer from '../ReportDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { validateWhatsappPhone } from '@/lib/utils';
import { UserProfile } from '@/hooks/useProfile';

interface Props {
  profile: UserProfile;
  services: Tables<'services'>[];
}

const ProfileView = ({
  profile,
  services
}: Props) => {
  const { user } = useAuth();
  const [isConvo, setIsConvo] = useState<boolean>(false);
  const [convoId, setConvoId] = useState<string>(null);

  const validWA = validateWhatsappPhone(profile.phone);

  return (
    <div>
      <ProfileHeader
        image={profile.profile_image_url}
        name={profile.full_name}
        phone={profile.phone}
      />
      <ProfileDataCard
        profile={profile}
        services={services}
      />
      <div className="flex gap-2 mt-5">
        <ContactOptions
          className='flex-1'
          providerId={profile.id}
          userId={user?.id}
          providerName={profile.full_name}
          convoId={convoId}
          isConvo={isConvo}
          setConvoId={setConvoId}
          setIsConvo={setIsConvo}
          phone={profile.phone}
          whatsappNumber={validWA.valid ? validWA.formatted : null}
        />
        <ReportDrawer
          itemId={profile?.id}
          itemType='user'
          itemLabel={profile?.full_name}
        />
      </div>
    </div>
  )
}

export default ProfileView