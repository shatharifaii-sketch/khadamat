import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Phone, PhoneCall, Copy, Star, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from './FindService/ServiceCategories';
import { PublicService } from '@/hooks/usePublicServices';
import ContactOptions from '@/components/Chat/ContactOptions';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ServiceDetailsModalProps {
  service: PublicService | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProvider: (service: PublicService) => void;
}

const ServiceDetailsModal = ({ service, isOpen, onClose, onViewProvider }: ServiceDetailsModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { trackServiceAction } = useAnalytics();

  // Track service view when modal opens
  useEffect(() => {
    if (isOpen && service) {
      trackServiceAction.mutate({
        serviceId: service.id,
        actionType: 'view'
      });
    }
  }, [isOpen, service, trackServiceAction]);
  
  const { data: serviceImages } = useQuery({
    queryKey: ['service-images', service?.id],
    queryFn: async () => {
      if (!service?.id) return [];
      
      const { data, error } = await supabase
        .from('service_images')
        .select('*')
        .eq('service_id', service.id)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!service?.id && isOpen,
  });

  if (!service) return null;

  const CategoryIcon = categories.find(cat => cat.value === service.category)?.icon || Star;
  const { data: profile } = useQuery({
    queryKey: ['service-provider-profile', service?.user_id],
    queryFn: async () => {
      if (!service?.user_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', service.user_id)
        .single();
      
      if (error) {
        console.error('Error fetching provider profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!service?.user_id && isOpen,
  });

  const providerName = profile?.full_name || 'مقدم الخدمة';

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const handlePhoneClick = (phone: string) => {
    copyToClipboard(phone, 'تم نسخ رقم الهاتف');
    trackServiceAction.mutate({
      serviceId: service.id,
      actionType: 'phone_click'
    });
  };

  const handleEmailClick = (email: string) => {
    copyToClipboard(email, 'تم نسخ البريد الإلكتروني');
    trackServiceAction.mutate({
      serviceId: service.id,
      actionType: 'email_click'
    });
  };

  const handleContactClick = () => {
    trackServiceAction.mutate({
      serviceId: service.id,
      actionType: 'contact_click'
    });
  };

  const nextImage = () => {
    if (serviceImages && serviceImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
    }
  };

  const prevImage = () => {
    if (serviceImages && serviceImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto arabic">
        <DialogHeader>
          <DialogTitle className="text-right text-2xl">{service.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-2 justify-end">
            <Badge variant="secondary" className="gap-2">
              <CategoryIcon size={16} />
              {categories.find(cat => cat.value === service.category)?.label || service.category}
            </Badge>
          </div>

          {serviceImages && serviceImages.length > 0 && (
            <div className="relative mb-6">
              <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                <img
                  src={serviceImages[currentImageIndex]?.image_url}
                  alt={`صورة الخدمة ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {serviceImages.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                      onClick={prevImage}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                      onClick={nextImage}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </>
                )}
              </div>
              {serviceImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                  {serviceImages.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-right">
            <h3 className="font-semibold mb-2">وصف الخدمة:</h3>
            <p className="text-muted-foreground leading-relaxed">{service.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-2">
                <span className="font-medium">{service.location}</span>
                <MapPin size={16} />
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-2">
                <span className="font-medium">{service.price_range}</span>
                <span>💰</span>
              </div>
            </div>
          </div>

          {service.experience && (
            <div className="text-right">
              <h3 className="font-semibold mb-2">سنوات الخبرة:</h3>
              <p className="text-muted-foreground">{service.experience}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => onViewProvider(service)}
                className="gap-2"
              >
                <User size={16} />
                عرض ملف مقدم الخدمة
              </Button>
              <div className="text-right">
                <h3 className="font-semibold">مقدم الخدمة:</h3>
                <p className="text-muted-foreground">{providerName}</p>
              </div>
            </div>

            <div className="flex gap-2">
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
                      onClick={() => handlePhoneClick(service.phone)}
                    >
                      <Copy size={16} />
                      نسخ الرقم
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <div onClick={handleContactClick}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailsModal;