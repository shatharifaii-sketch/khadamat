import ContactOptions from '@/components/Chat/ContactOptions';
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator';
import { Eye } from 'lucide-react';

interface Props {
    serviceDescription: string;
    publisherName: string;
    publisherEmail: string;
    publisherPhone: string;
    serviceCost: string;
    location: string;
    experience: string;
    views: number;
}

const ServiceDataCard = ({
    serviceDescription,
    publisherName,
    publisherEmail,
    publisherPhone,
    serviceCost,
    location,
    experience,
    views
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
                                        <span className='text-lg'>{views}</span>
                                        <Eye className="size-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className='text-muted-foreground border border-gray-100 rounded-lg p-4 text-lg'>{serviceDescription}</p>
                    </div>
                    <div className='flex items-center gap-8 my-5'>
                        <div className='flex items-center gap-4'>
                            <h3 className='text-lg font-semibold mt-4 text-nowrap'>تكلفة الخدمة</h3>
                            <h2 className='text-xl font-semibold text-primary text-nowrap'>{serviceCost}</h2>
                        </div>
                        <Separator orientation='vertical' className='h-5 mt-3' />
                        <div className='flex items-center gap-4'>
                            <h3 className='text-lg font-semibold mt-4 text-nowrap'>مكان الخدمة</h3>
                            <h2 className='text-xl font-semibold text-primary text-nowrap'>{location}</h2>
                        </div>
                        <Separator orientation='vertical' className='h-5 mt-3' />
                        <div className='flex items-center gap-4'>
                            <h3 className='text-lg font-semibold mt-4 text-nowrap'>الخبرة</h3>
                            <h2 className='text-xl font-semibold text-primary text-nowrap'>{experience}</h2>
                        </div>
                    </div>
                    <Separator />
                    <div className='space-y-3'>
                        <h3 className='text-xl font-semibold mt-4'>معلومات موفر الخدمة</h3>
                        <div className='space-y-2 text-muted-foreground'>
                            <p>الاسم الشخصي: {publisherName}</p>
                            <p>البريد الالكتروني: {publisherEmail}</p>
                            <p>رقم الهاتف: {publisherPhone}</p>
                        </div>
                    </div>
                </CardContent>
            </CardHeader>
        </Card>
    )
}

export default ServiceDataCard