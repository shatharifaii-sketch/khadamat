import { Reservation, ReservationList } from '@/contexts/ReservationsContext'
import React from 'react'

interface Props {
  reservation: Reservation | ReservationList;
}

const ReservationCard = ({
  reservation
}: Props) => {
  return (
    <div>ReservationCard</div>
  )
}

export default ReservationCard