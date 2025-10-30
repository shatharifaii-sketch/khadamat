import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Separator } from '../ui/separator'

interface Props {
    children: React.ReactNode
}

const ConvoLayout = ({ children }: Props) => {
    return (
        <div className='flex gap-5 justify-center items-center my-5'>
            <Card className='w-full shadow-none md:w-3/5 md:shadow-sm flex flex-col gap-5'>
                <CardHeader className='text-2xl font-semibold'>
                    المحادثات
                </CardHeader>
                <Separator />
                <CardContent className='px-3 overflow-y-auto max-h-[500px] min-h-[400px]'>
                    {children}
                </CardContent>
                <CardFooter className='flex items-center justify-center'>
                    <p className='text-muted-foreground/70'>هذه المحادثات متعلقة بخدمات معينة</p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default ConvoLayout