import React, { useState } from 'react'
import { ChatServiceProps } from '../ChatLayout'
import { ServiceImageProps } from '@/hooks/useServices';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { truncateString } from '@/lib/utils';

interface Props {
    service: ChatServiceProps;
    images?: ServiceImageProps[];
    setAttachment: React.Dispatch<React.SetStateAction<string | null>>
}
const ChatServiceData = ({ service, images, setAttachment }: Props) => {
    return (
        <div className='flex justify-between w-full items-start lg:items-start lg:flex-col lg:gap-10 gap-20' dir='ltr'>
            <div className='flex gap-3 lg:flex-col'>
                <div className='overflow-x-auto flex gap-2'>
                    {images.length > 0 ? (
                        <div>
                            {images.map(image => (
                                <div className='relative' key={image.id}>
                                    <Button 
                                        onClick={() => setAttachment(image.image_url)} className='absolute bottom-0 w-full backdrop-blur-sm bg-black/30 z-10 rounded-b-md opacity-0 hover:opacity-60 px-2 py-2 flex items-center gap-2 hover:cursor-pointer' variant='secondary' dir='rtl'>
                                        <Paperclip className='text-black' />
                                        <span className='text-xs text-black text-start opacity-100'>
                                            أضف الى الرسالة
                                        </span>
                                    </Button>
                                    <img className='border rounded-md max-h-70 w-[180px] lg:min-w-[300px]' src={image.image_url} alt={image.image_name} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
                <div className='text-start'>
                    <Link to={`/find-service/${service.id}`} className='text-2xl font-bold  hover:underline-offset-1'>{service.title}</Link>
                    <p className='text-muted-foreground'>{service.price_range}</p>
                    <p className='text-muted-foreground text-sm'>{service.location}</p>
                    <p className='text-muted-foreground text-sm'>{new Date(service.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div className='max-w-[400px]'>
                <p>{truncateString(service.description, 500)}</p>
            </div>
        </div>
    )
}

export default ChatServiceData