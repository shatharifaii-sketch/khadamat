import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types'
import ServiceDataCard from './ServiceDataCard';
import { TrendingUp } from 'lucide-react';

interface Props {
    services: Tables<'services'>[];
}

const ServicesCard = ({
    services
}: Props) => {
  return (
    <Card>
        <CardHeader>
            <CardTitle>خدمات المستخدم:</CardTitle>
            
            <CardDescription>
                <div className='flex items-center gap-2'>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>عدد الخدمات: {services.length}</span>
                </div>
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {
                services.map((service) => (
                    <ServiceDataCard
                        service={service}
                    />
                ))
            }
            </div>
        </CardContent>
    </Card>
  )
}

export default ServicesCard