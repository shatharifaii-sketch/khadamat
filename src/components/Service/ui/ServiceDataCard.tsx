import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator';
import { Eye } from 'lucide-react';
import ServiceImages from './ServiceImages';
import { PublicService } from '@/hooks/usePublicServices';
import { cn } from '@/lib/utils';

interface Props {
    service: PublicService
}

const ServiceDataCard = ({
    service
}: Props) => {
    return (
        <Card>
            <CardHeader>
                <CardContent>
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <h3 className='text-xl font-semibold'>وصف الخدمة</h3>
                            <div className="flex items-center justify-between text-muted-foreground opacity-70">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <span className='text-lg'>{service?.views}</span>
                                        <Eye className="size-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className='text-muted-foreground border border-gray-100 rounded-lg p-4 text-lg'>{service?.description}</p>
                    </div>
                    <div className='mt-5'>
                        <h3 className='text-xl font-semibold'>الملحقات</h3>
                        <div className='mt-3'>
                            <ServiceImages serviceId={service?.id} />
                        </div>
                    </div>
                    <div className={cn('flex my-5', service?.experience.length > 15 || service?.location.length > 15 || service?.price_range.length > 15 ? 'flex-col' : 'flex-col md:flex-row md:items-center md:gap-8')}>
                        <div className='flex items-center gap-4'>
                            <h3 className='text-lg font-semibold mt-4 text-nowrap'>تكلفة الخدمة</h3>
                            <h2 className='text-xl font-semibold text-primary text-nowrap'>{service?.price_range}</h2>
                        </div>
                        <Separator orientation='vertical' className='h-5 mt-3 hidden md:block' />
                        <div className='flex items-center gap-4'>
                            <h3 className='text-lg font-semibold mt-4 text-nowrap'>مكان الخدمة</h3>
                            <h2 className='text-xl font-semibold text-primary text-nowrap'>{service?.location}</h2>
                        </div>
                        <Separator orientation='vertical' className='h-5 mt-3 hidden md:block' />
                        <div className='flex items-center gap-4'>
                            <h3 className='text-lg font-semibold mt-4 text-nowrap'>الخبرة</h3>
                            <h2 className='text-xl font-semibold text-primary text-nowrap'>{service?.experience}</h2>
                        </div>
                    </div>
                    <Separator />
                    <div className='space-y-3'>
                        <h3 className='text-xl font-semibold mt-4'>معلومات موفر الخدمة</h3>
                        <div className='space-y-2 text-muted-foreground'>
                            <p>الاسم الشخصي: {service?.publisher.full_name}</p>
                            <p>البريد الالكتروني: {service?.email}</p>
                            <p>رقم الهاتف: {service?.phone}</p>
                        </div>
                    </div>
                </CardContent>
            </CardHeader>
        </Card>
    )
}

export default ServiceDataCard