import ServiceHeader from './ui/ServiceHeader'
import ServiceDataCard from './ui/ServiceDataCard'
import ContactOptions from '../Chat/ContactOptions';
import CategoryServices from './ui/CategoryServices';
import { Separator } from '../ui/separator';
import { PublicService } from '@/hooks/usePublicServices';
import { useServiceViews } from '@/hooks/useServiceViews';
import { Suspense, useEffect } from 'react';
import Reviews from './ui/Reviews';
import ErrorBoundary from '../ErrorBoundary';

interface Props {
  service: PublicService
}
const ServiceView = ({ service }: Props) => {
  const { incrementView } = useServiceViews();

  useEffect(() => {
    if (service?.id) {
      incrementView(service.id);
    }
  }, [service?.id, incrementView]);
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

      <div className="flex gap-2 pt-2">
        <ContactOptions
          className='w-3/4 mx-auto'
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