import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Separator } from '../ui/separator'
import { EllipsisVertical } from 'lucide-react'
import ChatMessageInput from './ui/ChatMessageInput'

const ChatLoading = () => {
  return (
    <div className='flex flex-col lg:flex-row items-center justify-center gap-7 md:gap-5 lg:items-start'>
      <div dir='ltr' className='flex flex-row lg:flex-col gap-10 md:gap-3 justify-between items-start lg:justify-end w-full'>
        <div className='flex flex-row gap-3 lg:flex-col'>
          <Skeleton className='h-[150px] w-[230px]' />
          <div className='flex flex-col gap-2 items-start'>
            <Skeleton className='h-[40px] w-[160px]' />
            <Skeleton className='h-[30px] w-[100px]' />
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <Skeleton className='h-[150px] w-[160px]' />
        </div>
      </div>
      <div className='md:min-w-[500px] lg:min-w-[800px] w-full'>
        <Card>
          <CardHeader>
            <div dir='ltr' className='flex justify-between items-center pr-2'>
              <div className='flex items-center justify-start gap-2'>
              <Skeleton className='rounded-full size-12' />
              <Skeleton className='h-10 w-20' />
            </div>
            <EllipsisVertical className='size-6 text-muted-foreground' />
            </div>
          </CardHeader>
          <Separator />
          <CardContent className='h-[400px]'>

          </CardContent>
          <Separator />
          <CardFooter className='flex items-center justify-center py-3'>
            <ChatMessageInput attachment={null} setAttachment={null} />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default ChatLoading