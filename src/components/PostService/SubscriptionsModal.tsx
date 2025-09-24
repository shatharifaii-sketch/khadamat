import { subscriptions } from '@/types/constants'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '../ui/card'
import { DialogHeader, Dialog, DialogDescription } from '../ui/dialog'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
    closeModal: () => void
}

const SubscriptionsModal = ({ closeModal }: Props) => {
    const navigate = useNavigate();
    const [yearly, setYearly] = useState<boolean>(false);

    const handleSubscriptionSelect = () => {
        navigate('/payment');
    }

    return (
        <Dialog>
            <DialogHeader className='text-2xl font-bold'>أنواع الاشتراك</DialogHeader>
            <DialogDescription className='flex flex-col gap-5'>
                <div className='border-2 border-dashed rounded-lg p-2'>
                    <div dir='ltr' className="flex items-center justify-center gap-2 mb-4">
                    <span className={cn(!yearly && "text-primary", 'transition-all text-lg')}>شهري</span>
                    <Switch checked={yearly} onCheckedChange={setYearly} />
                    <span className={cn(yearly && "text-primary", 'transition-all text-lg')}>سنوي</span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 w-full gap-x-4'>
                    {subscriptions.map((subscription) => (
                        <Card key={subscription.id} className={cn('col-span-1', subscription.className)}>
                            <CardHeader className='text-xl text-center font-bold'>
                                {subscription.title}
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    <div>
                                        {subscription.description}
                                    </div>
                                    <div>
                                        <div>
                                        </div>
                                        {yearly ?
                                            `${subscription.price.yearly.price} شيكل/سنة`
                                            :
                                            `${subscription.price.monthly.price} شيكل/شهر`
                                        }
                                    </div>
                                </CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                onClick={handleSubscriptionSelect}
                                variant='default'
                                className='bg-white text-muted-foreground flex-1 shadow-md border hover:text-white'>
                                    Subscribe
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                </div>

                <Button onClick={closeModal} className='flex-1' variant="outline">
                    Cancel
                </Button>

            </DialogDescription>
        </Dialog>
    )
}

export default SubscriptionsModal