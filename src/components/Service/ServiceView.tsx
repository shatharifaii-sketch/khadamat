import ServiceHeader from './ui/ServiceHeader'
import ServiceDataCard from './ui/ServiceDataCard'
import ContactOptions from '../Chat/ui/ContactOptions';
import { PublicService } from '@/hooks/usePublicServices';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '../ui/button';
import { MessageCircle } from 'lucide-react';

interface Props {
  service: PublicService;
  conversation?: any;
  isConvo: boolean;
  convoId: string | null;
  setConvoId: (id: string | null) => void;
  setIsConvo: (isConvo: boolean) => void;
  userId: string;
}
const ServiceView = ({ 
  service, 
  conversation,
  isConvo,
  convoId,
  setConvoId,
  setIsConvo,
  userId
}: Props) => {  
  return (
    <div className='flex flex-col gap-10'>
      <ServiceHeader
        title={service?.title}
        category={service?.category}
        publisherId={service?.publisher.id}
        publisherName={service?.publisher.full_name}
        publisherImage={service?.publisher.profile_image_url}
        updatedAt={service?.updated_at}
      />
      <ServiceDataCard
        service={service}
      />

      <div className="flex gap-2 pt-2 items-center justify-center">
        {isConvo && (
          <NavLink
            to={`/chat/${
              convoId
            }/${userId}/${
              service.id
            }/${service.publisher.id}`}
          >
            <Button variant='ghost' className='shadow border'>
              <MessageCircle />
              المحادثة
            </Button>
          </NavLink>
        )}
        <ContactOptions
          className='w-3/4'
          serviceId={service?.id}
          providerId={service.publisher.id}
          serviceName={service?.title}
          providerName={service?.publisher.full_name || 'مقدم الخدمة'}
          email={service?.email}
          phone={service?.phone}
          isConvo={isConvo}
          setIsConvo={setIsConvo}
          convoId={convoId}
          setConvoId={setConvoId}
        />
      </div>

      
    </div>
  )
}

export default ServiceView