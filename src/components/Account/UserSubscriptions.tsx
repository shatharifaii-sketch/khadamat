import { Subscription, useSubscription } from '@/hooks/useSubscription';
import React, { Suspense, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Clock, Star, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '../ui/drawer';
import ErrorBoundary from '../ErrorBoundary';
import SubscriptionsModal from '../PostService/SubscriptionsModal';
import { usePaymentLogic } from '@/hooks/usePaymentLogic';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

const UserSubscriptions = () => {
    const { getUserSubscriptions, deactivateSubscription, deactivatingSubscription } = useSubscription();
    const { getPaymentUrl } = usePaymentLogic();
    const [isPaymentTime, setIsPaymentTime] = useState<boolean>(false);
    const [openSubscribeModal, setOpenSubscribeModal] = useState<boolean>(false);
    const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false);
    const [openDeactivateModal, setOpenDeactivateModal] = useState<boolean>(false);
    const [currency, setCurrency] = useState<string>('JOD');

    if (!getUserSubscriptions.data) return null;

    const { activeSubscription, inactiveSubscriptions } = getUserSubscriptions.data;

    const handleDeactivate = async () => {
        deactivateSubscription.mutateAsync({ subscriptionId: activeSubscription.id });
    }

    const startPayment = () => {
        getPaymentUrl.mutateAsync({
            subscription: activeSubscription,
            total: activeSubscription.amount,
            currency: currency
        })
    }

    useEffect(() => {
        const subscription = activeSubscription;
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
    }, [activeSubscription]);

    const handlePay = async () => {
        const baseUrl = "https://crosspayonline.com/api/loginBill";
        const apiData = import.meta.env.VITE_BILLPS_APP_DATA.trim();
        const apiKey = import.meta.env.VITE_BILLPS_API_KEY.trim();

        const url = `${baseUrl}?api_data=${apiData}&apiKey=${apiKey}`;
        console.log("URL:", url);

        const res = await fetch(url);
        const data = await res.json();

        console.log(data);
    };



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
                {
                    activeSubscription ? (

                        <div className='flex items-center gap-3'>
                            <Card className='w-1/2 shadow-none'>
                                <CardHeader className='flex flex-row items-start justify-between'>
                                    <div className='text-lg font-bold'>
                                        {activeSubscription.subscription_tier.title}
                                        <p className='text-muted-foreground text-sm'>{activeSubscription.billing_cycle === "Monthly" ? "شهري" : "سنوي"}</p>
                                    </div>
                                    <Badge>
                                        {activeSubscription.status === 'active' ? 'جاري' : 'متوقف'}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-start justify-between gap-3">
                                        <div className='flex flex-col gap-2'>
                                            <div className='flex items-center gap-2'>
                                                <Badge className='flex items-center gap-2 justify-start py-2 text-sm' variant='secondary'>
                                                    <span>{activeSubscription.is_in_trial}</span>
                                                    <Clock className='h-4 w-4 text-primary' />فترة التجربة
                                                </Badge>
                                                <p className='text-xs text-muted-foreground'>تاريخ انتهاء التجربة: <span>{new Date(activeSubscription.trial_expires_at).toLocaleDateString('ar')}</span></p>
                                            </div>
                                            <span className='text-sm flex items-center gap-2 justify-start px-2'><span className='text-primary'>{activeSubscription.services_used}/{activeSubscription.services_allowed}</span> خدمات منشورة</span>
                                        </div>
                                        <Separator />
                                        <div className='flex flex-col text-sm'>
                                            <p>تاريخ الاشتراك: <span>{new Date(activeSubscription.created_at).toLocaleDateString('ar')}</span></p>
                                            <p>تاريخ انتهاء الاشتراك: <span>{new Date(activeSubscription.expires_at).toLocaleDateString('ar')}</span></p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={() => setOpenDeactivateModal(true)} disabled={deactivatingSubscription} className='flex-1'>
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
                                            تاريخ الدفع المقبل: <Badge variant='secondary' className='text-sm'>{new Date(activeSubscription.next_payment_date).toLocaleDateString('ar')}</Badge>
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                            تاريخ الدفع السابق: <Badge variant='secondary' className='text-sm'>{activeSubscription.is_in_trial ? '--' : new Date(activeSubscription.last_payment_date).toLocaleDateString('ar')}</Badge>
                                        </p>
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='text-sm text-muted-foreground'>في حال لم يحن تاريخ الدفع المحدد فلا يصح بدء عملية الدفع!</p>
                                        <Button onClick={() => setOpenPaymentModal(true)} className='flex-1 mt-3'>
                                            ابدأ عمليه الدفع
                                        </Button>
                                        {/*<button onClick={handlePay} className='flex-1 mt-3 bg-green-600 text-white p-2 rounded-md'>
                                            pay
                                        </button>*/}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    ) : (
                        <div className='flex flex-col items-center gap-3'>
                            <Badge variant='secondary' className='text-md text-muted-foreground'>
                                لا يوجد اشتراك مفعل حاليا
                            </Badge>
                            <Button onClick={() => setOpenSubscribeModal(true)}>
                                اشتراك الان
                            </Button>
                        </div>
                    )
                }
            </CardContent>

            <Dialog open={openDeactivateModal} onOpenChange={setOpenDeactivateModal}>
                <DialogContent className='flex flex-col gap-4'>
                    <DialogHeader>
                        <DialogTitle>هل انت متاكد؟</DialogTitle>
                        <DialogDescription>
                            هل انت متاكد من انك تريد الغاء تفعيل الاشتراك؟
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className='flex gap-2'>
                        <Button
                            variant="ghost"
                            onClick={() => setOpenDeactivateModal(false)}
                        >
                            الغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeactivate}
                            disabled={deactivatingSubscription}
                        >
                            {deactivatingSubscription ? "جاري المعالجة..." : "تاكيد"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={openPaymentModal} onOpenChange={() => setOpenPaymentModal(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>بدء عملية الدفع</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من رغبتك في بدء عملية الدفع للاشتراك الحالي؟
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant='ghost' onClick={() => setOpenDeactivateModal(false)}>الغاء</Button>
                        <Button variant='default' onClick={startPayment}>{deactivatingSubscription ? 'جاري المعالجة...' : 'نعم'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Drawer
                direction='right'
                open={openSubscribeModal}
                onOpenChange={() => setOpenSubscribeModal(false)}
            >
                <DrawerContent className='h-screen w-full sm:w-4/5 lg:w-2/5 transition-all rounded-none'>
                    <DrawerHeader className='flex items-center justify-between'>
                        <DrawerTitle className='text-2xl text-start'>
                            أنواع الاشتراك
                        </DrawerTitle>
                    </DrawerHeader>
                    <DrawerDescription className='flex flex-col gap-4 px-5 overflow-y-auto'>
                        <div>
                            <p>يجب على جميع الاشتراك بأحد العروض المتوفرة للحصول على قدرة نشر الخدمات</p>
                        </div>
                        <Suspense fallback={<div>Loading...</div>}>
                            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                                <SubscriptionsModal />
                            </ErrorBoundary>
                        </Suspense>
                    </DrawerDescription>
                    <DrawerFooter>
                        <DrawerClose className='flex'>
                            <Button variant='ghost' className='flex-1'>إلغاء</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <CardFooter className='pt-5 px-10 flex flex-col items-start gap-3'>
                <Separator />
                <Label className='text-lg'>الاشتراكات السابقة</Label>
                {
                    inactiveSubscriptions ? (
                        <div className='flex gap-3'>
                            {
                                inactiveSubscriptions.map((subscription: Subscription) => (
                                    <Card key={subscription.id} className=''>
                                        <CardHeader className='flex flex-row items-start justify-between w-[300px]'>
                                            <div className='text-lg font-bold'>
                                                {subscription.subscription_tier.title}
                                                <p className='text-muted-foreground text-sm'>{subscription.billing_cycle === "Monthly" ? "شهري" : "سنوي"}</p>
                                            </div>
                                            <Badge>
                                                {subscription.status === 'active' ? 'جاري' : 'متوقف'}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <p className='text-sm'>تاريخ الاشتراك: <span>{new Date(subscription.created_at).toLocaleDateString('ar')}</span></p>
                                                <p>تاريخ الدفع السابق: <span>{new Date(subscription.last_payment_date).toLocaleDateString('ar')}</span></p>
                                                <p>تاريخ ايقاف الاشتراك: <span>{new Date(subscription.subscription_ended_at).toLocaleDateString('ar')}</span></p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </div>
                    ) : (
                        <div>
                            لا يوجد اشتراكات سابقة
                        </div>
                    )
                }
            </CardFooter>

        </Card>
    )
}

export default UserSubscriptions