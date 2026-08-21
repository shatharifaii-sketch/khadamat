import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Reservation, ReservationList } from '@/contexts/ReservationsContext'
import React from 'react'
import { useTranslation } from 'react-i18next';

interface Props {
  reservation: Reservation | ReservationList;
}

const ReservationCard = ({
  reservation
}: Props) => {
  const { t } = useTranslation("reservations");

  return (
    <Card className='h-full'>
      <CardContent>
        <CardHeader>
          
        </CardHeader>
      </CardContent>
    </Card>
  )
}

export default ReservationCard