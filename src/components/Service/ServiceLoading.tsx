import { Eye, Loader, Loader2 } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

const ServiceLoading = () => {
  return (
    <div>
      <div className='flex flex-row justify-between items-center mb-4'>
        <div className='flex flex-row gap-4 justify-start items-center'>
          <Skeleton className='size-10 rounded-full border' />
          <Skeleton className='h-8 min-w-37.5 border' />
        </div>
        
      </div>

      <div>
        <div className='h-105 w-full bg-card rounded-md'>
          <div className='flex items-center px-10 py-7 justify-between'>
            <Skeleton className='h-10 w-37.5 rounded-md' />
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