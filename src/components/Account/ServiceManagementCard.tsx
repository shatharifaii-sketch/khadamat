
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Calendar, Edit, Eye, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ServiceStatusIndicator from './ServiceStatusIndicator';
import { useServiceAnalytics } from '@/hooks/useServiceAnalytics';

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
  const navigate = useNavigate();

  // Fetch accurate analytics data for this service
  const { data: analyticsData, isLoading: analyticsLoading } = useServiceAnalytics(service.id);

  const handleEditService = () => {
    navigate(`/post-service?edit=${service.id}`);
  };

  // Check if service was recently created (within last 24 hours)
  const isNewlyPublished = () => {
    const now = new Date();
    const serviceDate = new Date(service.created_at);
    const timeDiff = now.getTime() - serviceDate.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff <= 24 && service.status === 'published';
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
            <ServiceStatusIndicator 
              status={service.status}
              views={analyticsData?.totalViews || service.views}
              isNewlyPublished={isNewlyPublished()}
            />
            
            {/* Enhanced analytics display */}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>
                  {analyticsLoading ? '...' : (analyticsData?.totalViews || service.views)} مشاهدة
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={14} />
                <span>
                  {analyticsLoading ? '...' : (analyticsData?.totalContacts || 0)} تواصل
                </span>
              </div>
            </div>
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
            <Calendar size={14} />
            <span>نُشرت في {new Date(service.created_at).toLocaleDateString('ar')}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <Button 
            onClick={handleEditService}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <Edit size={16} className="mr-2" />
            تعديل الخدمة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceManagementCard;
