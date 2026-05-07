import { GeneratedAvatar } from '@/components/GeneratedAvatar';
import ReportDrawer from '@/components/ReportDrawer';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { EllipsisVertical } from 'lucide-react';
import { useState } from 'react';

interface Props {
  user: {
    id: string;
    full_name: string;
    profile_image_url: string;
  };
}

const ChatSimpleData = ({ user }: Props) => {
  return (
    <div className='flex justify-between items-center'>
      <div>
        <Popover>
          <PopoverTrigger className='hover:bg-muted p-2 rounded-full'>
            <EllipsisVertical className='size-6 text-muted-foreground' />
          </PopoverTrigger>
          <PopoverContent className='p-1'>
            <ReportDrawer
              itemId={user.id}
              itemType='user'
              itemLabel={user.full_name}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className='flex items-center gap-2 justify-end'>
        <h1>{user.full_name}</h1>
        {user.profile_image_url ? (
          <Avatar className='size-10'>
            <AvatarImage
              src={user.profile_image_url}
            />
          </Avatar>
        ) : (
          <GeneratedAvatar
            seed={user.full_name}
            variant="initials"
            className="size-10"
          />
        )}
      </div>
    </div>
  )
}

export default ChatSimpleData