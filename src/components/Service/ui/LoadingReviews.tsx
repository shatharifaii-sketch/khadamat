import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const LoadingReviews = () => {
    return (
        <div className='flex w-full gap-4 mx-auto items-center justify-start overflow-x-auto'>
            {[1, 2].map((item, index) => (
                <Card className='w-96 p-4'>
                    <CardHeader className='flex justify-between items-center flex-row'>
                        <div className='flex  items-center gap-2'>
                            <Skeleton key={index} className='size-9 rounded-full' />
                            <Skeleton className='h-6 w-20 rounded-md' />
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className='pt-4'>
                        <Skeleton className='h-4 w-full mb-2 rounded-md' />
                        <Skeleton className='h-4 w-full mb-2 rounded-md' />
                        <Skeleton className='h-4 w-3/4 rounded-md' />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default LoadingReviews