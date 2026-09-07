import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ReservationsService } from '@/hooks/useReservations'
import { Dot } from 'lucide-react';
import React from 'react'
import { useTranslation } from 'react-i18next';

interface Props {
    service: ReservationsService;
}

const ResServiceCard = ({
    service
}: Props) => {
    const { t } = useTranslation("reservations");

    // const { updateAvailability } = useReservations({
    //  providerId: userId,
    //  serviceId: service.id
    // });

  return (
    <Card>
        <CardHeader className='px-3 py-2'>
            <CardTitle className='text-md'>
                {t("services.card.title")}
            </CardTitle>
            <CardDescription className='flex items-center justify-start text-wrap'>
                {!service.is_online && service.location 
                ? t(service.location) 
                : service.is_online ? (
                    <p>{t("service.card.online")}</p>
                ) 
                : ""}
                <Dot />
                {service.price_range}
            </CardDescription>
        </CardHeader>
        <CardFooter className='px-3 pb-3'>
            <Button 
            variant='secondary'
            className='w-full text-wrap'
            >
                {t("service.card.update_availability")}
            </Button>
        </CardFooter>
    </Card>
  )
}

export default ResServiceCard