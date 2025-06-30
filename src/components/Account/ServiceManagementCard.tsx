
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Phone, Calendar } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  phone: string;
  views: number;
  status: string;
  created_at: string;
}

interface ServiceManagementCardProps {
  service: Service;
}

const ServiceManagementCard = ({ service }: ServiceManagementCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'منشورة';
      case 'draft': return 'مسودة';
      case 'inactive': return 'غير نشطة';
      default: return status;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{service.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {service.description}
            </p>
            <Badge variant={getStatusColor(service.status)}>
              {getStatusText(service.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{service.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <span>{service.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={14} />
            <span>{service.views} مشاهدة</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>نُشرت في {new Date(service.created_at).toLocaleDateString('ar')}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            تعديل
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            إدارة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceManagementCard;
