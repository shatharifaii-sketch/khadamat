import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '../ui/card'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { Star } from 'lucide-react'
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers'
import { Tables } from '@/integrations/supabase/types'

interface SubscriptionsModalProps {
    cardClassName?: string;
    switchClassName?: string;
}
const SubscriptionsModal = ({ cardClassName, switchClassName }: SubscriptionsModalProps) => {
    const navigate = useNavigate();
    const [yearly, setYearly] = useState<boolean>(false);

    const { subscriptionTiersData } = useSubscriptionTiers();

    const handleSubscriptionSelect = (subscription: Tables<'subscription_tiers'>) => {
        const serviceData = JSON.parse(localStorage.getItem('serviceData') || '{}');
        console.log(serviceData)
        navigate('/payment', { state: { subscriptionToGet: subscription, serviceData }});
    }

    return (
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
                    {subscriptionTiersData.map((subscription) => (
                        <Card key={subscription.id} className={cn('col-span-1 flex flex-col justify-between', subscription.class_name, cardClassName)}>
                            <CardHeader className='text-2xl text-center font-bold'>
                                {subscription.title}
                                <span className='block mt-3'>
                                    <Badge className={cn('flex items-center gap-2 w-fit mx-auto', subscription.badge_class_name)}>
                                        <Star className='text-yellow-400' />{subscription.free_trial_period_text}
                                    </Badge>
                                </span>
                                <span className='text-sm'>عدد الخدمات المتاحة: {subscription.allowed_services}</span>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className='flex flex-col gap-4'>
                                    <div>
                                        <div className={cn('border-2 border-dashed rounded-lg p-2', subscription.class_name)}>
                                            <p className={cn('flex items-center gap-2', subscription.class_name)}>
                                                نقاط مهمة للاشتراك:
                                            </p>
                                            <ul className='list-disc list-inside'>
                                                {subscription.notes.map((note) => (
                                                    <li className='text-start' key={note}>{note}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className='mt-4'>
                                            <Badge className={cn('text-lg rounded-md', subscription.badge_class_name)}>
                                                {yearly ?
                                                        `${subscription.price_yearly_value} شيكل/سنة
                                                        `
                                                    :
                                                    `${subscription.price_monthly_value} شيكل/شهر`
                                                }
                                            </Badge>
                                        </div>
                                    </div>
                                </CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={() => handleSubscriptionSelect(subscription)}
                                    variant='default'
                                    className='bg-white text-muted-foreground flex-1 shadow-md border hover:text-white'>
                                    اشتراك
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                <div className='px-5 mt-5 mb-2'>
                    <p>- الاشتراك يتجدد تلقائيا في حال عدم الالغاء</p>
                    <p>- سيتم اعلامك من خلال البريد الالكتروني والمنصة للتاكد من الدفع الشهري</p>
                </div>
            </div>
        </div>
    )
}

export default SubscriptionsModal