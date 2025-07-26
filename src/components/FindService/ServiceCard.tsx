import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Phone, PhoneCall, Copy, Star, Eye, User } from 'lucide-react';
import { categories } from './ServiceCategories';
import { PublicService } from '@/hooks/usePublicServices';
import ContactOptions from '@/components/Chat/ContactOptions';
import { toast } from 'sonner';
import { useServiceViews } from '@/hooks/useServiceViews';
import ServiceDetailsModal from '@/components/ServiceDetailsModal';
import ProviderProfileModal from '@/components/ProviderProfileModal';

interface ServiceCardProps {
  service: PublicService;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [showProviderProfile, setShowProviderProfile] = useState(false);
  const CategoryIcon = categories.find(cat => cat.value === service.category)?.icon || Star;
  const providerName = service.profiles?.full_name || 'مقدم الخدمة';
  const { incrementView } = useServiceViews();

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const handleViewService = (e: React.MouseEvent) => {
    e.stopPropagation();
    incrementView(service.id);
    setShowServiceDetails(true);
  };

  const handleViewProvider = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProviderProfile(true);
  };

  const handleCardClick = () => {
    incrementView(service.id);
    setShowServiceDetails(true);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 text-right">{service.title}</CardTitle>
            <CardDescription className="text-right mb-2 line-clamp-2">
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
            <strong>مقدم الخدمة:</strong> 
            <button 
              onClick={handleViewProvider}
              className="text-primary hover:underline mr-1"
            >
              {providerName}
            </button>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProvider}
              className="gap-2"
            >
              <User size={14} />
              الملف الشخصي
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                  <Phone size={14} className="ml-1" />
                  اتصل
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${service.phone}`);
                    }}
                  >
                    <PhoneCall size={16} />
                    {service.phone}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(service.phone, 'تم نسخ رقم الهاتف');
                    }}
                  >
                    <Copy size={16} />
                    نسخ الرقم
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div onClick={(e) => e.stopPropagation()}>
              <ContactOptions
                serviceId={service.id}
                providerId={service.user_id}
                serviceName={service.title}
                providerName={providerName}
                email={service.email}
                phone={service.phone}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <ServiceDetailsModal
      service={service}
      isOpen={showServiceDetails}
      onClose={() => setShowServiceDetails(false)}
      onViewProvider={() => {
        setShowServiceDetails(false);
        setShowProviderProfile(true);
      }}
    />

    <ProviderProfileModal
      service={service}
      isOpen={showProviderProfile}
      onClose={() => setShowProviderProfile(false)}
    />
    </>
  );
};

export default ServiceCard;
