import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { Card, CardContent, CardHeader } from '../ui/card'

const ProfileLoading = () => {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col justify-center items-center gap-2'>
        <Skeleton className='h-36 w-36 rounded-full' />
        <Skeleton className='h-9 w-44' />
        <Skeleton className='h-7 w-44' />
        <Skeleton className='h-7 w-52' />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-10 w-1/4' />
          </CardHeader>
        <CardContent className=''>
        <div>
          <Skeleton className='h-28 border w-full mb-2' />
          <div className='flex justify-between items-center'>
            <Skeleton className='h-7 w-80 mb-4' />
            <Skeleton className='h-7 w-52 mb-2' />
          </div>
        </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className='h-10 w-1/4' />
          <Skeleton className='h-5 w-1/5' />
          </CardHeader>
        <CardContent className=''>
        <div className='flex gap-3'>
          <Skeleton className='h-28 border w-1/4 mb-2' />
          <Skeleton className='h-28 border w-1/4 mb-2' />
          <Skeleton className='h-28 border w-1/4 mb-2' />
        </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileLoading