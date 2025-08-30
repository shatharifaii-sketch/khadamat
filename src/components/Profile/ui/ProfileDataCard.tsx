import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import ServicesCard from './ServicesCard';
import PersonalDataCard from './PersonalDataCard';

interface Props {
    profile: Tables<'profiles_with_email'>
    services: Tables<'services'>[];
}
const ProfileDataCard = ({
    profile,
    services
}: Props) => {
    return (
        <div className='space-y-7'>
            <PersonalDataCard
                description={profile.bio}
                joinedAt={profile.created_at}
                location={profile.location}
                experienceYears={profile.experience_years}
            />
            <ServicesCard services={services} />
        </div>
    )
}

export default ProfileDataCard