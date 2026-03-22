import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button'
import { Switch } from '../ui/switch';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Star } from 'lucide-react';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import { DrawerDescription, DrawerHeader, DrawerTitle } from '../ui/drawer';
import useStripe from '@/hooks/use-stripe';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { User } from '../Admin/ui/UserForm';
import { toast } from 'sonner';

interface SubscriptionsModalProps {
    cardClassName?: string;
    switchClassName?: string;
    user?: User;
    setDrawerOpen?: (isOpen: boolean) => void;
    asDrawer?: boolean;
}

interface SubscriptionCardProps {
    subscription: any;
    yearly: boolean;
    selectedSubscription: any;
    cardClassName?: string;
    onSelect: (sub: any) => void;
    onNavigate: (priceId: string) => void;
    isCreatingCheckoutSessionPending: boolean;
    setDrawerOpen?: (isOpen: boolean) => void;
}

const SubscriptionCard = ({ subscription, yearly, selectedSubscription, cardClassName, onSelect, onNavigate, isCreatingCheckoutSessionPending, setDrawerOpen }: SubscriptionCardProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Card className={cn('col-span-1 flex flex-col justify-between', subscription.class_name, cardClassName)}>
            <CardHeader className='text-2xl text-center font-bold'>
                {subscription?.title}
                <span className='block mt-3'>
                    <Badge className={cn('flex items-center gap-2 w-fit mx-auto', subscription.badge_class_name)}>
                        <Star className='text-yellow-400' />{subscription.free_trial_period_text}
                    </Badge>
                </span>
                <span className='text-sm'>عدد الخدمات المتاحة: {subscription.allowed_services}</span>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-4'>
                    <div>
                        <div className={cn('border-2 border-dashed rounded-lg p-2', subscription.class_name)}>
                            <span className={cn('flex items-center gap-2', subscription.class_name)}>
                                نقاط مهمة للاشتراك:
                            </span>
                            <ul className='list-disc list-inside'>
                                {(subscription.notes ?? []).map((note: string) => (
                                    <li className='text-start' key={note}>{note}</li>
                                ))}
                            </ul>
                        </div>
                        <div className='mt-4'>
                            <Badge className={cn('text-lg rounded-md', subscription.badge_class_name)}>
                                {yearly ?
                                    `${subscription.price_yearly_value} شيكل/سنة`
                                    :
                                    `${subscription.price_monthly_value} شيكل/شهر`
                                }
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => onSelect(subscription)}
                            variant='default'
                            className='bg-white text-muted-foreground flex-1 shadow-md border hover:text-white'
                            disabled={isCreatingCheckoutSessionPending}
                        >
                            اشتراك
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                أنت الآن على وشك الإنتقال إلى بوابة الدفع!
                            </DialogTitle>
                            <DialogDescription>
                                هل أنت متأكد من انك تريد الانتقال لبوابة الدفع؟
                            </DialogDescription>
                        </DialogHeader>
                        {selectedSubscription && (
                            <Card className={cn('col-span-1 flex flex-col justify-between', selectedSubscription.class_name, cardClassName)}>
                                <CardHeader className='text-2xl text-center font-bold'>
                                    {selectedSubscription?.title}
                                    <span className='block mt-3'>
                                        <Badge className={cn('flex items-center gap-2 w-fit mx-auto', selectedSubscription.badge_class_name)}>
                                            <Star className='text-yellow-400' />{selectedSubscription.free_trial_period_text}
                                        </Badge>
                                    </span>
                                    <span className='text-sm'>عدد الخدمات المتاحة: {selectedSubscription.allowed_services}</span>
                                </CardHeader>
                                <CardContent>
                                    <div className='flex flex-col gap-4'>
                                        <div>
                                            <div className={cn('border-2 border-dashed rounded-lg p-2', selectedSubscription.class_name)}>
                                                <span className={cn('flex items-center gap-2', selectedSubscription.class_name)}>
                                                    نقاط مهمة للاشتراك:
                                                </span>
                                                <ul className='list-disc list-inside'>
                                                    {(selectedSubscription.notes ?? []).map((note: string) => (
                                                        <li className='text-start' key={note}>{note}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className='mt-4'>
                                                <Badge className={cn('text-lg rounded-md', selectedSubscription.badge_class_name)}>
                                                    {yearly ?
                                                        `${selectedSubscription.price_yearly_value} شيكل/سنة`
                                                        :
                                                        `${selectedSubscription.price_monthly_value} شيكل/شهر`
                                                    }
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        <DialogFooter>
                            <Button
                                onClick={() =>
                                    onNavigate(yearly ? selectedSubscription.stripe_yearly_price_id : selectedSubscription.stripe_monthly_price_id)}
                                variant='default'
                                className='bg-white text-muted-foreground flex-1 shadow-md border hover:text-white'
                                disabled={isCreatingCheckoutSessionPending}
                            >
                                الإنتقال إلى بوابة الدفع
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
};

const SubscriptionsModal = ({ cardClassName, switchClassName, user, setDrawerOpen }: SubscriptionsModalProps) => {
    const [yearly, setYearly] = useState<boolean>(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const navigate = useNavigate()

    const { subscriptionTiersData } = useSubscriptionTiers();
    const { createCheckoutSession, isCreatingCheckoutSessionPending } = useStripe();

    const handleSubscriptionSelect = (subscriptionTier: any) => {
        setSelectedSubscription(subscriptionTier);
    }

    const handleNavigationToPaymentWindow = (price_id: string) => {
        if (!user) {
            toast.error('يرجى تسجيل الدخول');
            return navigate('/auth');
        };
        createCheckoutSession({ priceId: price_id, userId: user.id, email: user.email });

        setDrawerOpen && setDrawerOpen(false);
    }

    return (
        <>
            <DrawerHeader className='flex items-center justify-between'>
                <DrawerTitle className='text-2xl text-start'>
                    أنواع الاشتراك
                </DrawerTitle>
            </DrawerHeader>
            <DrawerDescription className='flex flex-col gap-4 px-5 overflow-y-auto'>
                <div>
                    <p>اختار نوع الاشتراك المناسب لك لتتمكن من نشر خدمتك.</p>
                </div>
                <div className='flex flex-col gap-5'>
                    <div className='border-2 border-dashed rounded-lg p-2 lg:px-4'>
                        <p className='text-lg mb-2'>اختر نوع الاشتراك المناسب:</p>
                        <div dir='ltr' className="flex flex-col items-center justify-center gap-2 mb-4">
                            <div className={cn('flex items-center gap-2', switchClassName)}>
                                <span className={cn(!yearly && "text-primary", 'transition-all text-lg')}>شهري</span>
                                <Switch checked={yearly} onCheckedChange={setYearly} />
                                <span className={cn(yearly && "text-primary", 'transition-all text-lg')}>سنوي</span>
                            </div>
                            <p className='text-muted-foreground/50'>حدد خطة الدفع</p>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 w-full gap-4'>
                            {(subscriptionTiersData ?? []).map((subscription) => (
                                <SubscriptionCard
                                    key={subscription.id}
                                    subscription={subscription}
                                    yearly={yearly}
                                    selectedSubscription={selectedSubscription}
                                    cardClassName={cardClassName}
                                    onSelect={handleSubscriptionSelect}
                                    onNavigate={handleNavigationToPaymentWindow}
                                    isCreatingCheckoutSessionPending={isCreatingCheckoutSessionPending}
                                    setDrawerOpen={setDrawerOpen}
                                />
                            ))}
                        </div>
                        <div className='px-5 mt-5 mb-2'>
                            <p>- الاشتراك يتجدد تلقائيا في حال عدم الالغاء</p>
                            <p>- سيتم اعلامك من خلال البريد الالكتروني والمنصة للتاكد من الدفع الشهري</p>
                        </div>
                    </div>
                </div>
            </DrawerDescription>
        </>
    )
}

export default SubscriptionsModal