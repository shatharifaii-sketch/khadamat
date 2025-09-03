import ServiceHeader from './ui/ServiceHeader'
import ServiceDataCard from './ui/ServiceDataCard'
import ContactOptions from '../Chat/ContactOptions';
import CategoryServices from './ui/CategoryServices';
import { Separator } from '../ui/separator';

interface Props {
  service: any
}
const ServiceView = ({ service }: Props) => {
  console.log(service);
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
        serviceDescription={service?.description}
        publisherName={service?.publisher.full_name}
        publisherEmail={service?.email}
        publisherPhone={service?.phone}
        serviceCost={service?.price_range}
        location={service?.location}
        experience={service?.experience}
        views={service?.views}
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

      <Separator />

      <CategoryServices category={service?.category} serviceId={service?.id} />
    </div>
  )
}

export default ServiceView