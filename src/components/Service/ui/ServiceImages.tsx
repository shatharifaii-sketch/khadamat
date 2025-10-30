import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useServiceImages } from '@/hooks/useServices';
import React, { useEffect, useState } from 'react'

interface Props {
    serviceId: string
}
const ServiceImages = ({ serviceId }: Props) => {
    const images = useServiceImages(serviceId);
    const [api, setApi] = useState<CarouselApi>(null);
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api]);

    return (
        <div dir='ltr'>
            {images.length > 0 ? (
                <>
                    <Carousel className='w-3/4 mx-auto py-3' setApi={setApi}>
                        <CarouselContent>
                            {images.map((image) => (
                                <CarouselItem
                                    key={image.id}
                                    className='basis-full shrink-0 flex items-center justify-center'>
                                    <img className='border rounded-md object-contain max-h-70' src={image.image_url} alt={image.image_name} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselNext className='bg-primary' />
                        <CarouselPrevious className='bg-primary' />
                    </Carousel>
                    <div className="text-muted-foreground py-2 text-center text-xs">
                        صورة {current} من {count}
                    </div>
                </>
            ) : (
                <div className='flex items-center justify-end'>
                    <p className='text-muted-foreground text-sm bg-muted py-1 px-2 rounded-full opacity-60'>لا يوجد صور ملحقة لهذه الخدمة</p>
                </div>
            )}
        </div>
    )
}

export default ServiceImages