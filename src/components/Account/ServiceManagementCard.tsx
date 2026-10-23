
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Calendar, Edit, Eye, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceStatusIndicator from './ServiceStatusIndicator';
import { useServiceAnalytics } from '@/hooks/useServiceAnalytics';
import { useTranslation } from 'react-i18next';

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
  canPost: boolean;
}

const ServiceManagementCard = ({ service, canPost }: ServiceManagementCardProps) => {
  const { t } = useTranslation("account");
  const lang = localStorage.getItem('language') || 'en';
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
    <Card className="hover:shadow-md transition-shadow" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 text-start">
              <Link to={service.status === 'published' ? `/find-service/${service.id}` : '#'}>
                {service.title}
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2 text-start">
              {service.description}
            </p>
            <ServiceStatusIndicator 
              status={service.status}
              views={analyticsData?.totalViews || service.views}
              isNewlyPublished={isNewlyPublished()}
            />
            
            {/* Enhanced analytics display */}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-start">
                <Eye size={14} />
                <span>
                  {analyticsLoading ? '...' : (analyticsData?.totalViews || service.views)} {t("service_card.views")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={14} />
                <span>
                  {analyticsLoading ? '...' : (analyticsData?.totalContacts || 0)} {t("service_card.contact")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 text-start">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{t(service.location)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <span>{service.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{t("service_card.published_at")} {new Date(service.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US')}</span>
          </div>
        </div>
        
        <div className="mt-4 text-start">
          <Button 
            onClick={handleEditService}
            variant="outline" 
            size="sm" 
            className="w-full"
            disabled={!canPost}
          >
            <Edit size={16} className="mr-2" />
            {t("service_card.edit_service")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceManagementCard;
