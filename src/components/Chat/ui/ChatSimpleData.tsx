import { GeneratedAvatar } from '@/components/GeneratedAvatar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { EllipsisVertical } from 'lucide-react';
import { useState } from 'react';

interface Props {
    provider: {
        id: string;
        full_name: string;
        profile_image_url: string;
    };
}

const ChatSimpleData = ({provider}: Props) => {
  const [reportDesc, setReportDesc] = useState<string>('');

  const handleReport = () => {
    console.log(reportDesc);
  }

  return (
    <div className='flex justify-between items-center'>
        <div>
            <Popover>
                  <PopoverTrigger className='hover:bg-muted p-2 rounded-full'>
                    <EllipsisVertical className='size-6 text-muted-foreground' />
                  </PopoverTrigger>
                  <PopoverContent className='p-1'>
                    <Dialog>
                      <DialogTrigger className='text-sm w-full text-start hover:bg-muted py-3 rounded-sm px-2'>
                        إبدأ شكوى
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <h1 className='text-lg font-bold'>إبدأ شكوى ضد {provider.full_name}</h1>
                        </DialogHeader>
                        <DialogDescription>
                          <h4 className='font-bold'>شرح المشكلة</h4>
                          <Textarea className='mt-2 placeholder:opacity-50 mb-4 text-black' placeholder='اكتب هنا...' rows={5} onChange={(e) => setReportDesc(e.target.value)} />
                        </DialogDescription>
                        <DialogFooter>
                          <Button onClick={handleReport}>
                            أرسل الشكوى
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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