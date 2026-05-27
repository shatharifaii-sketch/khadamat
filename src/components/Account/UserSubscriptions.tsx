import { Subscription, useSubscription } from '@/hooks/useSubscription';
import { act, Suspense, useEffect, useState } from 'react'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { User } from '../Admin/ui/UserForm';
import useStripe from '@/hooks/use-stripe';
import { useTranslation } from 'react-i18next';

interface UserSubscriptionsProps {
    user: User, 
}

const UserSubscriptions = ({ user }: UserSubscriptionsProps) => {
    const { t } = useTranslation("account");
    const lang = localStorage.getItem("language") || "en";

    const { getUserSubscriptions, deactivateSubscription, deactivatingSubscription, deactivateSubscriptionSuccess } = useSubscription();
    const { billingPortalSession, isCreatingBillingPortalSession, isCreateBillingPortalSessionError, isCreateBillingPortalSessionSuccess, createExtraCheckoutSession, isCreatingExtraCheckoutSessionPending, isCreateExtraCheckoutSessionError, isCreateExtraCheckoutSessionSuccess } = useStripe();
    const { getPaymentUrl } = usePaymentLogic();
    const [isPaymentTime, setIsPaymentTime] = useState<boolean>(false);
    const [openSubscribeModal, setOpenSubscribeModal] = useState<boolean>(false);
    const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false);
    const [openDeactivateModal, setOpenDeactivateModal] = useState<boolean>(false);
    const [currency, setCurrency] = useState<string>('ILS');

    const { activeSubscription, inactiveSubscriptions, extraProductsCount } = getUserSubscriptions.data;

    console.log('activeSubscription: ', activeSubscription);
    console.log('inactiveSubscriptions: ', inactiveSubscriptions);
    console.log('extraProductsCount: ', extraProductsCount);

    const isPayable = activeSubscription ? new Date() > new Date(activeSubscription.next_payment_date) && !activeSubscription.is_in_trial : false;

    const handleDeactivate = async () => {
        deactivateSubscription.mutateAsync({
            sub_id: activeSubscription.id,
            email: user.email,
            name: user.full_name,
            stripe_sub_id: activeSubscription.stripe_subscription_id
        });
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

    useEffect(() => {
        if (deactivateSubscriptionSuccess) {
            setOpenDeactivateModal(false);
        }
    }, [deactivateSubscriptionSuccess]);


    return (
        <Card dir={lang === "ar" ? "rtl" : "ltr"}>
            <CardHeader className='text-start'>
                <div className="flex items-center justify-between">
                    <div className='flex flex-col gap-2'>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            <div>{t("subscriptions.subscriptions_info")}</div>
                        </CardTitle>
                        <CardDescription>
                            {t("subscriptions.subscriptions_description")}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {
                    activeSubscription ? (

                        <div className='flex flex-col md:flex-row md:items-center gap-3 text-start'>
                            <Card className='md:w-1/2 shadow-none'>
                                <CardHeader className='flex flex-row items-start justify-between'>
                                    <div className='text-lg font-bold'>
                                        {activeSubscription.subscription_tier.title}
                                        <p className='text-muted-foreground text-sm'>{activeSubscription.billing_cycle === "monthly" ? t("subscriptions.monthly") : t("subscriptions.yearly")}</p>
                                    </div>
                                    <Badge>
                                        {activeSubscription.status === 'active' ? t("subscriptions.active") : t("subscriptions.inactive")}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-start justify-between gap-3">
                                        <div className='flex flex-col gap-2'>
                                            {
                                                activeSubscription.is_in_trial && (
                                                    <div className='flex items-center gap-2'>
                                                        <Badge className='flex items-center gap-2 justify-start py-2 text-sm' variant='secondary'>
                                                            <span>{activeSubscription.is_in_trial}</span>
                                                            <Clock className='h-4 w-4 text-primary' />
                                                            {t("subscriptions.trial_period")}
                                                        </Badge>
                                                        <p className='text-xs text-muted-foreground'>
                                                            {t("subscriptions.trial_ends")} 
                                                             <span> {new Date(activeSubscription.trial_expires_at).toLocaleDateString(lang === "ar" ? "ar" : 'en')}</span></p>
                                                    </div>
                                                )
                                            }
                                            <span className='text-sm flex items-center gap-2 justify-start px-2'><span className='text-primary'>{activeSubscription.services_used}/{activeSubscription.services_allowed}</span> {t("subscriptions.services_used")}</span>
                                        </div>
                                        <Separator />
                                        <div className='flex flex-col text-sm'>
                                            <p>{t("subscriptions.created_at")} <span>{new Date(activeSubscription.created_at).toLocaleDateString(lang === "ar" ? "ar" : 'en')}</span></p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={() => setOpenDeactivateModal(true)} disabled={deactivatingSubscription} className='flex-1'>
                                        {
                                            new Date(activeSubscription.expires_at).getTime() < new Date().getTime() ? t("subscriptions.renew") : t("subscriptions.deactivate")
                                        }
                                    </Button>
                                </CardFooter>
                            </Card>
                            <Card className='md:w-1/2 shadow-lg relative'>
                                <CardHeader>
                                    <CardTitle>
                                        {t("subscriptions.billing")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='flex flex-col gap-5'>
                                    <div className='flex flex-col gap-2'>
                                        <p>
                                            {t("subscriptions.next_payment_date")} <Badge variant='secondary' className='text-sm'>{new Date(activeSubscription.next_payment_date).toLocaleDateString(lang === "ar" ? "ar" : 'en')}</Badge>
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                            {t("subscriptions.last_payment_date")} <Badge variant='secondary' className='text-sm'>{activeSubscription.is_in_trial ? '--' : new Date(activeSubscription.last_payment_date).toLocaleDateString(lang === "ar" ? "ar" : 'en')}</Badge>
                                        </p>
                                    </div>
                                    <div className='flex flex-col'>
                                        <Button
                                            onClick={() => billingPortalSession(activeSubscription.stripe_customer_id)}
                                            className='flex-1'
                                            disabled={isCreatingBillingPortalSession}
                                        >
                                            {t("subscriptions.billing_portal")}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                createExtraCheckoutSession({
                                                    userId: user.id,
                                                    email: user.email,
                                                    name: "Extra Service"
                                                })
                                            }}
                                            className='flex-1 mt-1'
                                            disabled={isCreatingExtraCheckoutSessionPending || activeSubscription.services_used < (activeSubscription.services_allowed + extraProductsCount)}
                                        >
                                            {t("subscriptions.get_extra_service")}
                                        </Button>
                                        {/* <Button
                                            onClick={() => setOpenPaymentModal(true)} className='flex-1 mt-3'
                                            disabled={true}
                                        >
                                            {t("subscriptions.pay_now")}
                                        </Button> */}
                                        {/*<button onClick={handlePay} className='flex-1 mt-3 bg-green-600 text-white p-2 rounded-md'>
                                            pay
                                        </button>*/}
                                    </div>
                                </CardContent>
                                {/* <div className='absolute inset-0 z-50 backdrop-blur-md rounded-lg'></div> */}
                            </Card>
                        </div>

                    ) : (
                        <div className='flex flex-col items-center gap-3'>
                            <Badge variant='secondary' className='text-md text-muted-foreground'>
                                {t("subscriptions.no_active_subscriptions")}
                            </Badge>
                            <Button onClick={() => setOpenSubscribeModal(true)}>
                                {t("subscriptions.subscribe_now")}
                            </Button>
                        </div>
                    )
                }
            </CardContent>

            <Dialog open={openDeactivateModal} onOpenChange={setOpenDeactivateModal}>
                <DialogContent className='flex flex-col gap-4'>
                    <DialogHeader>
                        <DialogTitle>{t("subscriptions.deactivate_prompt")}</DialogTitle>
                        <DialogDescription>
                            {t("subscriptions.deactivate_description")}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className='flex gap-2'>
                        <Button
                            variant="ghost"
                            onClick={() => setOpenDeactivateModal(false)}
                        >
                            {t("subscriptions.cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeactivate}
                            disabled={deactivatingSubscription}
                        >
                            {deactivatingSubscription ? t("subscriptions.deactivating") : t("subscriptions.deactivate_button")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* <Dialog open={openPaymentModal} onOpenChange={() => setOpenPaymentModal(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("subscriptions.start_payment_process")}</DialogTitle>
                        <DialogDescription>
                            {t("subscriptions.start_payment_description")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant='ghost' onClick={() => setOpenPaymentModal((prev) => !prev)}>
                            {t("subscriptions.cancel")}
                        </Button>
                        <Button variant='default' onClick={startPayment}>
                            {deactivatingSubscription ? t("subscriptions.deactivating") : t("subscriptions.pay_now")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}

            <Drawer
                direction={lang === "ar" ? 'right' : 'left'}
                open={openSubscribeModal}
                onOpenChange={() => setOpenSubscribeModal(false)}
            >
                <DrawerContent className='h-screen w-full sm:w-4/5 lg:w-2/5 transition-all rounded-none'>
                    <DrawerDescription className='flex flex-col gap-4 px-5 overflow-y-auto'>
                        <Suspense fallback={<div>Loading...</div>}>
                            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                                <SubscriptionsModal setDrawerOpen={() => setOpenSubscribeModal(false)} user={user} />
                            </ErrorBoundary>
                        </Suspense>
                    </DrawerDescription>
                    <DrawerFooter>
                        <DrawerClose className='flex'>
                            <Button variant='ghost' className='flex-1'>{t("subscriptions.drawer.close")}</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <CardFooter className='pt-5 px-10 flex flex-col items-start gap-3'>
                <Separator />
                <Label className='text-lg'>{t("subscriptions.past_subscriptions")}</Label>
                {
                    inactiveSubscriptions && inactiveSubscriptions.length > 0 ? (
                        <div className='grid grid-cols-2 w-full gap-3 overflow-y-auto max-h-[300px] border p-2 rounded-md'>
                            {
                                inactiveSubscriptions.map((subscription: Subscription) => (
                                    <Card key={subscription.id} className='col-span-1'>
                                        <CardHeader className='flex flex-row items-start justify-between w-[300px]'>
                                            <div className='text-lg font-bold'>
                                                {subscription.subscription_tier.title}
                                                <p className='text-muted-foreground text-sm'>{(subscription.billing_cycle === "Monthly" || subscription.billing_cycle === "monthly") ? "شهري" : "سنوي"}</p>
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
                        <div className='text-muted-foreground'>
                            {t("subscriptions.no_past_subscriptions")}
                        </div>
                    )
                }
            </CardFooter>

        </Card>
    )
}

export default UserSubscriptions