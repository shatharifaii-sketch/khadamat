import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const ConvosLoading = () => {
  return (
    <div className='w-full flex items-center justify-center my-5'>
        <Card className='w-full shadow-none md:w-3/5 md:shadow-sm flex flex-col gap-5'>
            <CardHeader>
                <h1 className='text-2xl font-semibold'>المحادثات</h1>
            </CardHeader>
            <Separator />
            <CardContent className='flex flex-col gap-3'>
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton className='h-[60px] rounded-none' />
                ))}
            </CardContent>
            <CardFooter>

            </CardFooter>
        </Card>
    </div>
  )
}

export default ConvosLoading