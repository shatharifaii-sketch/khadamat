import { useSubscription } from '@/hooks/useSubscription';
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Clock, Star, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';

const UserSubscriptions = () => {
    const { getUserSubscription, deactivateSubscription, deactivatingSubscription } = useSubscription();
    const [isPaymentTime, setIsPaymentTime] = useState<boolean>(false);

    const handleDeactivate = async () => {
        deactivateSubscription.mutateAsync({ subscriptionId: getUserSubscription.data?.id });
    }

    useEffect(() => {
        const subscription = getUserSubscription.data;
        if (!subscription?.next_payment_date) return;

        const now = new Date();
        const nextPayment = new Date(subscription.next_payment_date);

        const onDay = 24 * 60 * 60 * 1000;

        const diff = now.getTime() - nextPayment.getTime();

        if (now >= nextPayment && diff < onDay && diff >= 0) {
            setIsPaymentTime(true);
        } else {
            setIsPaymentTime(false);
        }
    }, [getUserSubscription.data]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className='flex flex-col gap-2'>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            <div>الاشتراكات</div>
                        </CardTitle>
                        <CardDescription>
                            إدارة ومتابعة اشتراكاتك
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className='flex items-center gap-3'>
                    <Card className='w-1/2 shadow-none'>
                    <CardHeader className='flex flex-row items-start justify-between'>
                        <div className='text-lg font-bold'>
                            {getUserSubscription.data?.subscription_tier.title}
                        <p className='text-muted-foreground text-sm'>{getUserSubscription.data?.billing_cycle === "Monthly" ? "شهري" : "سنوي"}</p>
                        </div>
                        <Badge>
                            {getUserSubscription.data?.status === 'active' ? 'جاري' : 'متوقف'}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-start justify-between gap-3">
                            <div className='flex flex-col gap-2'>
                                <div className='flex items-center gap-2'>
                                    <Badge className='flex items-center gap-2 justify-start py-2 text-sm' variant='secondary'>
                                    <span>{getUserSubscription.data?.is_in_trial}</span>
                                    <Clock className='h-4 w-4 text-primary' />فترة التجربة
                                </Badge>
                                <p className='text-xs text-muted-foreground'>تاريخ انتهاء التجربة: <span>{new Date(getUserSubscription.data?.trial_expires_at).toLocaleDateString('ar')}</span></p>
                                </div>
                                <span className='text-sm flex items-center gap-2 justify-start px-2'><span className='text-primary'>{getUserSubscription.data?.services_used}/{getUserSubscription.data?.services_allowed}</span> خدمات منشورة</span>
                            </div>
                            <Separator />
                            <div className='flex flex-col text-sm'>
                                <p>تاريخ الاشتراك: <span>{new Date(getUserSubscription.data?.created_at).toLocaleDateString('ar')}</span></p>
                                <p>تاريخ انتهاء الاشتراك: <span>{new Date(getUserSubscription.data?.expires_at).toLocaleDateString('ar')}</span></p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleDeactivate} disabled={deactivatingSubscription} className='flex-1'>
                            الغاء تفعيل الاشتراك
                        </Button>
                    </CardFooter>
                </Card>
                <Card className='w-1/2 shadow-lg'>
                    <CardHeader>
                        <CardTitle>
                            الدفع
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-5'>
                        <div className='flex flex-col gap-2'>
                            <p>
                                تاريخ الدفع المقبل: <Badge variant='secondary' className='text-sm'>{new Date(getUserSubscription.data?.next_payment_date).toLocaleDateString('ar')}</Badge>
                            </p>
                            <p className='text-sm text-muted-foreground'>
                                تاريخ الدفع السابق: <Badge variant='secondary' className='text-sm'>{getUserSubscription.data?.is_in_trial ? '--' : new Date(getUserSubscription.data?.last_payment_date).toLocaleDateString('ar')}</Badge>
                            </p>
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-sm text-muted-foreground'>في حال لم يحن تاريخ الدفع المحدد فلا يصح بدء عملية الدفع!</p>
                            <Button disabled={!isPaymentTime} className='flex-1 mt-3'>
                                ابدأ عمليه الدفع
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                </div>
            </CardContent>
        </Card>
    )
}

export default UserSubscriptions