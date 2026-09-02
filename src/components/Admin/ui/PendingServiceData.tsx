import { Button } from '@/components/ui/button';
import ServiceImages from '@/components/Service/ui/ServiceImages';
import { Service, useAdminFunctionality } from '@/hooks/useAdminFunctionality';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { ServiceLink } from '@/components/PostService/ServiceLinks';

interface Props {
    service: Service | null;
    setServiceToAccept: React.Dispatch<React.SetStateAction<Service | null>>
}

const PendingServiceData = ({
    service,
    setServiceToAccept
}: Props) => {
    const { t } = useTranslation("admin");
    const lang = localStorage.getItem("language") || "en";

    const { acceptServicePost } = useAdminFunctionality();

    const handleAccept = () => {
        if (service) {
            acceptServicePost.mutateAsync(service.id).then(() => {
                setServiceToAccept(null);
            });
        }
    }

    if (!service) return null;

    const serviceLinks = service.links as ServiceLink[]

    return (
        <div className='relative' dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className='flex flex-col gap-6 overflow-y-auto max-h-[60vh] pr-2 text-start'>
                <h1 className='flex flex-col'>
                    {t("table.pending_services_management.data.title_name")}
                    <span className='px-4 text-2xl'>
                        {service.title}
                    </span>
                </h1>
                <p className='flex flex-col'>
                    {t("table.pending_services_management.data.title_description")}
                    <span className='px-4'>
                        {service.description}
                    </span>
                </p>
                <p className='flex flex-col'>
                    {t("table.pending_services_management.data.title_price")}
                    <span className='px-4'>
                        {service.price_range}
                    </span>
                </p>
                <p className='flex flex-col'>
                    {t("table.pending_services_management.data.title_whatsapp")}:
                    <span className='px-4'>
                        {service.whatsapp_number 
                        ? typeof service.whatsapp_number === 'string' ? service.whatsapp_number : `${service.whatsapp_number.countryCode} ${service.whatsapp_number.number}` 
                        : 'اونلاين'}
                    </span>
                </p>
                <p className='flex flex-col'>
                    {t("table.pending_services_management.data.title_location")}
                    <span className='px-4'>
                        {service.location ? t(service.location) : t("table.pending_services_management.data.offline_fallback")}
                    </span>
                </p>
                <p className='flex flex-col'>
                    {t("table.pending_services_management.data.links_title")}
                    {serviceLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className='flex flex-col items-end'
                        >
                            <span>{link.type}</span>
                            <span className='text-xs text-muted-foreground' dir='ltr'>{link.url}</span>
                        </a>
                    ))}
                </p>
                <div>
                    <h3 className='text-lg font-semibold'>{t("table.pending_services_management.data.attachments")}</h3>
                    <div className='mt-3 border border-dashed border-muted-foreground rounded-lg'>
                        <ServiceImages serviceId={service.id} />
                    </div>
                </div>
            </div>
            <Separator className="mt-4" />
            <div className='w-full'>
                <h3 className='text-lg font-semibold'>{t("table.pending_services_management.data.accept_title")}</h3>
                <div className='mt-3 flex items-center'>
                    <Button onClick={handleAccept} className='flex-1'>
                        {t("table.pending_services_management.data.accept_button")}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PendingServiceData