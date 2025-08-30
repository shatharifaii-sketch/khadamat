import { Tables } from '@/integrations/supabase/types'
import { Avatar, AvatarImage } from '../ui/avatar'
import { GeneratedAvatar } from '../GeneratedAvatar'

interface Props {
    user: Tables<'profiles'>
}
const MainUserDetails = ({user}: Props) => {
  return (
    <div className='flex items-center justify-center flex-col mb-5'>
        <div>
            {user.profile_image_url ? (
                    <Avatar>
                        <AvatarImage
                            src={user.profile_image_url}
                        />
                    </Avatar>
                ) : (
                    <GeneratedAvatar
                        seed={user.full_name}
                        variant="initials"
                        className="size-32"
                    />
                )}
        </div>
        <div>
            <h1 className='text-2xl'>{user.full_name}</h1>
            <p className='text-muted-foreground'>{user.bio}</p>
        </div>
    </div>
  )
}

export default MainUserDetails