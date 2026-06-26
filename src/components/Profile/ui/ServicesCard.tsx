import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types'
import ServiceDataCard from './ServiceDataCard';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
    services: Tables<'services'>[];
}

const ServicesCard = ({
    services
}: Props) => {
    const { t } = useTranslation("profile");
    const lang = localStorage.getItem("language") || "en";
  return (
    <Card>
        <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
            <CardTitle>{t("services.title")}:</CardTitle>
            
            <CardDescription>
                <div className='flex items-center gap-2'>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{t("services.num")}: {services.length}</span>
                </div>
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border rounded-lg p-2 bg-muted overflow-y-auto'>
                {
                services.map((service) => (
                    <ServiceDataCard
                        key={service.id}
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