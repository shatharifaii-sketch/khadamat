import { GeneratedAvatar } from '@/components/GeneratedAvatar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EllipsisVertical } from 'lucide-react';

interface Props {
    provider: {
        id: string;
        full_name: string;
        profile_image_url: string;
    };
}

const ChatSimpleData = ({provider}: Props) => {
  return (
    <div className='flex justify-between items-center'>
        <div>
            <Popover>
                  <PopoverTrigger className='hover:bg-muted p-2 rounded-full'>
                    <EllipsisVertical className='size-6 text-muted-foreground' />
                  </PopoverTrigger>
                  <PopoverContent>
                    <Button variant='ghost' className='w-full flex justify-start'>
                      ابدأ شكوى
                    </Button>
                  </PopoverContent>
                </Popover>
        </div>
        <div className='flex items-center gap-2 justify-end'>
            <h1>{provider.full_name}</h1>
            {provider.profile_image_url ? (
                    <Avatar className='size-10'>
                        <AvatarImage
                            src={provider.profile_image_url}
                        />
                    </Avatar>
                ) : (
                    <GeneratedAvatar
                        seed={provider.full_name}
                        variant="initials"
                        className="size-10"
                    />
                )}
        </div>
    </div>
  )
}

export default ChatSimpleData