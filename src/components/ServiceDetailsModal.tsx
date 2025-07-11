import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Phone, PhoneCall, Copy, Star, User } from 'lucide-react';
import { categories } from './FindService/ServiceCategories';
import { PublicService } from '@/hooks/usePublicServices';
import ContactOptions from '@/components/Chat/ContactOptions';
import { toast } from 'sonner';

interface ServiceDetailsModalProps {
  service: PublicService | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProvider: (service: PublicService) => void;
}

const ServiceDetailsModal = ({ service, isOpen, onClose, onViewProvider }: ServiceDetailsModalProps) => {
  if (!service) return null;

  const CategoryIcon = categories.find(cat => cat.value === service.category)?.icon || Star;
  const providerName = service.profiles?.full_name || 'مقدم الخدمة';

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailsModal;