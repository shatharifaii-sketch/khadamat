import React from 'react'
import ProfileHeader from './ui/ProfileHeader';
import { Tables } from '@/integrations/supabase/types';
import ProfileDataCard from './ui/ProfileDataCard';
import ContactOptions from '../Chat/ui/ContactOptions';

interface Props {
    profile: Tables<'profiles_with_email'>;
    services: Tables<'services'>[];
}

const ProfileView = ({
    profile,
    services
}: Props) => {
  return (
    <div>
        <ProfileHeader
            image={profile.profile_image_url}
            email={profile.email}
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
            providerName={profile.full_name || 'مقدم الخدمة'}
            email={profile.email}
            phone={profile.phone}
          />
        </div>
    </div>
  )
}

export default ProfileView