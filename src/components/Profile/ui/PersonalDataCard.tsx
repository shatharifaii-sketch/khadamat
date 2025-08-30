import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import React from 'react'

interface Props {
    description: string;
    joinedAt: string;
    location: string;
    experienceYears: number;
}

const PersonalDataCard = ({
    description,
    joinedAt,
    location,
    experienceYears
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>الوصف</CardTitle>
                <CardDescription className='text-muted-foreground border border-gray-100 rounded-lg p-4 text-lg'>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex items-center justify-between'>
                    <div className='flex justify-start gap-5'>
                        <div className='flex items-center justify-start gap-5'>
                            <CardTitle className='text-md'>المنطقة:</CardTitle>
                            <CardDescription className={cn(location && 'text-primary text-lg', !location && 'text-muted-foreground')}>
                                {location || 'غير محدد'}
                            </CardDescription>
                        </div>
                        <Separator orientation='vertical' className='h-6' />
                        <div className='flex items-center justify-start gap-5'>
                            <CardTitle className='text-md'>سنوات الخبرة:</CardTitle>
                            <CardDescription className={cn(location && 'text-primary text-lg', !location && 'text-muted-foreground')}>
                                {experienceYears || 'غير محدد'}
                            </CardDescription>
                        </div>
                    </div>
                    <div className='flex items-center justify-start gap-5'>
                            <CardTitle className='text-sm text-muted-foreground/70'>تاريخ الانضمام:</CardTitle>
                            <CardDescription className='text-primary text-md'>
                                {joinedAt.split('T')[0]}
                            </CardDescription>
                        </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PersonalDataCard