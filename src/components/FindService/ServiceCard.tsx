
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Phone, PhoneCall, Copy, Star } from 'lucide-react';
import { categories } from './ServiceCategories';
import { PublicService } from '@/hooks/usePublicServices';
import ContactOptions from '@/components/Chat/ContactOptions';
import { toast } from 'sonner';

interface ServiceCardProps {
  service: PublicService;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const CategoryIcon = categories.find(cat => cat.value === service.category)?.icon || Star;
  const providerName = service.profiles?.full_name || 'مقدم الخدمة';

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 text-right">{service.title}</CardTitle>
            <CardDescription className="text-right mb-2">
              {service.description}
            </CardDescription>
            <div className="flex items-center gap-2 justify-end mb-2">
              <Badge variant="secondary" className="gap-1">
                <CategoryIcon size={14} />
                {categories.find(cat => cat.value === service.category)?.label || service.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
            <span>{service.location}</span>
            <MapPin size={16} />
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium justify-end">
            <span>{service.price_range}</span>
            <span>💰</span>
          </div>

          {service.experience && (
            <div className="text-sm text-muted-foreground text-right">
              <strong>الخبرة:</strong> {service.experience}
            </div>
          )}

          <div className="text-sm text-muted-foreground text-right">
            <strong>مقدم الخدمة:</strong> {providerName}
          </div>

          <div className="flex gap-2 pt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Phone size={16} className="ml-2" />
                  اتصل
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => window.open(`tel:${service.phone}`)}
                  >
                    <PhoneCall size={16} />
                    {service.phone}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => copyToClipboard(service.phone, 'تم نسخ رقم الهاتف')}
                  >
                    <Copy size={16} />
                    نسخ الرقم
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <ContactOptions
              serviceId={service.id}
              providerId={service.user_id}
              serviceName={service.title}
              providerName={providerName}
              email={service.email}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
