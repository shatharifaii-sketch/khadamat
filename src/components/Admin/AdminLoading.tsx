import React from 'react'
import { Skeleton } from '../ui/skeleton'

const AdminLoading = () => {
  return (
    <div className='space-y-8'>
      <div className='grid w-full grid-cols-2 gap-6'>
        <Skeleton className="h-32 w-full shadow-xs bg-white border-muted-foreground" />
        <Skeleton className="h-32 w-full shadow-xs bg-white border-muted-foreground" />
      </div>
      <div>
        <Skeleton className="h-125 w-full shadow-xs bg-white border-muted-foreground" />
      </div>
    </div>
  )
}

export default AdminLoading