import { Button } from '@/components/ui/button';
import { Service } from '../ServiceManagement'
import ServiceImages from '@/components/Service/ui/ServiceImages';
import { useServices } from '@/hooks/useServices';
import { useAdminFunctionality } from '@/hooks/useAdminFunctionality';

interface Props {
    service: Service | null;
    setServiceToAccept: React.Dispatch<React.SetStateAction<Service | null>>
}

const PendingServiceData = ({
    service,
    setServiceToAccept
}: Props) => {
    const { acceptServicePost } = useAdminFunctionality();

    const handleAccept = () => {
        if (service) {
            acceptServicePost.mutateAsync(service.id).then(() => {
                setServiceToAccept(null);
            });
        }
    }

    if (!service) return null;

  return (
    <div className='flex flex-col gap-6'>
        <h1 className='flex flex-col'>
            اسم الخدمة:
            <span className='px-4'>
                {service.title}
            </span>
        </h1>
        <p className='flex flex-col'>
            وصف الخدمة: 
            <span className='px-4'>
                {service.description}
            </span>
        </p>
        <p className='flex flex-col'>
            تكلفة الخدمة: 
            <span className='px-4'>
                {service.price_range}
            </span>
        </p>
        <p className='flex flex-col'>
            الموقع: 
            <span className='px-4'>
                {service.location}
            </span>
        </p>
        <div>
            <h3 className='text-lg font-semibold'>الملحقات</h3>
            <div className='mt-3 border border-dashed border-muted-foreground rounded-lg'>
                <ServiceImages serviceId={service.id} />
            </div>
        </div>
        <div>
            <h3 className='text-lg font-semibold'>إقبل نشر الخدمة</h3>
            <div className='mt-3 flex items-center'>
                <Button onClick={handleAccept} className='flex-1'>
                    نشر الخدمة
                </Button>
            </div>
        </div>
    </div>
  )
}

export default PendingServiceData