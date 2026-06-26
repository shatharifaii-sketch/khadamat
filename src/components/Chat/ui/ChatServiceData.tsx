import React, { useState } from 'react'
import { ChatServiceProps } from '../ChatLayout'
import { ServiceImageProps } from '@/hooks/useServices';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Props {
    service: ChatServiceProps;
    images?: ServiceImageProps[];
    setAttachment: React.Dispatch<React.SetStateAction<string | null>>
}
const ChatServiceData = ({ service, images, setAttachment }: Props) => {
    const { t } = useTranslation("chat");
    const [imageHovered, setImageHovered] = useState<string | null>(null);

    return (
        <div className='flex justify-center md:justify-start w-full items-start lg:items-start lg:flex-col lg:gap-10 gap-20' dir='ltr'>
            <div className='flex gap-3 items-center justify-center'>
                    {images.length > 0 ? (
                        <div className='overflow-auto flex lg:flex-col gap-2 w-[200px] h-[130px] lg:w-[350px] lg:max-h-[500px] lg:min-h-[210px]'>
                            {images.map(image => (
                                <div className='relative min-w-[200px] flex items-center object-center' key={image.id} onMouseEnter={() => setImageHovered(image.id)} onMouseLeave={() => setImageHovered(null)}>
                                    <Button 
                                        onClick={() => setAttachment(image.image_url)} className={cn('absolute bottom-0 w-full backdrop-blur-md bg-black/30 z-10 rounded-b-md opacity-0 px-2 py-2 flex items-center gap-2', imageHovered === image.id && 'opacity-60 cursor-pointer bg-white')} variant='secondary' dir='rtl'>
                                        <Paperclip className='text-black' />
                                        <span className='text-xs text-black text-start opacity-100'>
                                            {t("add_attachment")}
                                        </span>
                                    </Button>
                                    <img className='border rounded-md max-h-50 lg:min-w-[300px]' src={image.image_url} alt={image.image_name} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <></>
                    )}
                <div className='text-center md:text-start'>
                    <Link to={`/find-service/${service.id}`} className='text-xl font-bold  hover:underline-offset-1'>{service.title}</Link>
                    <p className='text-muted-foreground'>{service.price_range}</p>
                    <p className='text-muted-foreground text-sm'>{t(service.location)}</p>
                    <p className='text-muted-foreground text-sm'>{new Date(service.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    )
}

export default ChatServiceData