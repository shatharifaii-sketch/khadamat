import { Eye, Loader, Loader2 } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

const ServiceLoading = () => {
  return (
    <div>
      <div className='flex flex-row justify-between items-center mb-4'>
        <div className='flex flex-row gap-4 justify-start items-center'>
          <Skeleton className='size-10 rounded-full' />
          <Skeleton className='h-8 min-w-[150px]' />
        </div>
        <div className='flex flex-col items-end'>
          <div className='flex flex-row gap-2'>
            <Skeleton className='h-8 w-32' />
            <Skeleton className='h-12 w-[200px]' />
          </div>
          <Skeleton className='h-4 w-24 mt-2' />
        </div>
      </div>

      <div>
        <div className='h-[420px] w-full bg-card rounded-md'>
          <div className='flex items-center px-10 py-7 justify-between'>
            <Skeleton className='h-10 w-[150px] rounded-md' />
            <div className='flex items-center gap-2'>
              <Loader className='animate-spin text-muted-foreground/60' />
              <Eye className='size-6 text-muted-foreground/60' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceLoading