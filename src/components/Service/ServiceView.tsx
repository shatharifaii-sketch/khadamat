import ServiceHeader from './ui/ServiceHeader'
import ServiceDataCard from './ui/ServiceDataCard'
import ContactOptions from '../Chat/ui/ContactOptions';
import CategoryServices from './ui/CategoryServices';
import { Separator } from '../ui/separator';
import { PublicService } from '@/hooks/usePublicServices';
import { useServiceViews } from '@/hooks/useServiceViews';
import { Suspense, useEffect, useRef } from 'react';
import Reviews from './ui/Reviews';
import ErrorBoundary from '../ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { MessageCircle } from 'lucide-react';

interface Props {
  service: PublicService;
  conversation?: any;
}
const ServiceView = ({ service, conversation }: Props) => {
  const { user } = useAuth();
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
        {conversation && (
          <Link to={`/chat/${conversation.id}/${conversation.client_id}/${conversation?.service_id}/${conversation?.provider_id}`}>
          <Button variant='ghost' className='shadow border'>
            <MessageCircle />
             المحادثة
          </Button>
        </Link>
        )}
        <ContactOptions
          className='w-3/4'
          serviceId={service?.id}
          providerId={service.publisher.id}
          serviceName={service?.title}
          providerName={service?.publisher.full_name || 'مقدم الخدمة'}
          email={service?.email}
          phone={service?.phone}
        />
      </div>

      <div>
        <Suspense fallback={<div>Loading reviews...</div>}>
          <ErrorBoundary fallback={<div>Failed to load reviews.</div>}>
            <Reviews serviceId={service?.id} />
          </ErrorBoundary>
        </Suspense>
      </div>

      <Separator />

      <CategoryServices category={service?.category} serviceId={service?.id} />
    </div>
  )
}

export default ServiceView