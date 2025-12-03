import { Conversation } from '@/hooks/useConversations'
import { useServiceImages } from '@/hooks/useServices';
import React, { useEffect, useState } from 'react'
import ServiceImages from '../Service/ui/ServiceImages';
import ChatServiceData from './ui/ChatServiceData';

export interface ChatServiceProps {
    id: string;
    title: string;
    description: string;
    price_range: string;
    location: string;
    phone: string;
    email: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    service: ChatServiceProps;
    children: React.ReactNode;
    setAttachment: React.Dispatch<React.SetStateAction<string | null>>
}

const ChatLayout = ({ service, children, setAttachment }: Props) => {
    const [images, setImages] = useState([]);
    const serviceImages = useServiceImages(service?.id);
    
    useEffect(() => {
        if (serviceImages) {
            setImages(serviceImages);
        }
    }, [serviceImages]);

    return (
        <div className='flex gap-5 justify-center items-center lg:items-start flex-col lg:flex-row'>
            <div className='w-full min-w-[200px]'>
                <ChatServiceData service={service} images={images} setAttachment={setAttachment} />
            </div>
            <div className='md:min-w-[500px] lg:min-w-[800px] w-full'>
                {children}
            </div>
        </div>
    )
}

export default ChatLayout