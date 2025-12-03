import React from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { CircleSlash } from 'lucide-react'
import { Button } from '../ui/button'

const UserProfileQueryError = () => {
  return (
    <Card className='w-[500px] mx-auto bg-opacity-30'>
        <CardHeader className='flex items-center'>
            <CircleSlash className='h-6 w-6 text-red-500' />
            <p>
                حدث خطأ أثناء تحميل معلومات المستخدم. الرجاء المحاولة مرة أخرى لاحقًا.
            </p>
        </CardHeader>
        <CardContent className='flex'>
            <Button className='flex-1' variant='outline' onClick={() => window.location.reload()}>
                إعادة المحاولة
            </Button>
        </CardContent>
    </Card>
  )
}

export default UserProfileQueryError