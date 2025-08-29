import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Eye, Star, MessageCircle, Heart } from 'lucide-react';
import ContactOptions from '@/components/Chat/ContactOptions';
import { useServiceViews } from '@/hooks/useServiceViews';

import { useAuth } from '@/contexts/AuthContext';
import { categories } from '@/components/FindService/ServiceCategories';
import type { PublicService } from '@/hooks/usePublicServices';
import { truncateString } from '@/lib/utils';
import { NavLink, useNavigate } from 'react-router-dom';

interface EnhancedServiceCardProps {
  service: PublicService;
}

const EnhancedServiceCard = ({ service }: EnhancedServiceCardProps) => {
  const { incrementView } = useServiceViews();
  const navigate = useNavigate()

  const { user } = useAuth();

  const categoryLabel = categories.find(cat => cat.value === service.category)?.label || service.category;

  const handleViewService = () => {
    incrementView(service.id);
    navigate(`/find-service/${service.id}`);
  };

  return (
    <Card className="group flex flex-col justify-between hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-0 shadow-md hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {categoryLabel}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              <Button 
              variant='link'
              onClick={handleViewService}
              className='text-lg hover:no-underline px-0'>
                {service.title}
              </Button>
              <NavLink 
              to={`/profile/${service.publisher?.id}`} className='text-sm text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors'
              >
              {service.publisher?.full_name}
              
              </NavLink>
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <CardDescription className="text-sm line-clamp-3 text-right leading-relaxed">
          {truncateString(service.description, 100)}
        </CardDescription>

        {/* Price and Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 justify-end">
            <span className="font-semibold text-primary">{service.price_range}</span>
            <Badge variant="outline" className="text-xs">السعر</Badge>
          </div>
          <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground">
            <span>{service.location}</span>
            <MapPin className="h-4 w-4" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span>{service.views}</span>
              <Eye className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <ContactOptions
            className='flex-1'
            serviceId={service.id}
            providerId={service.user_id}
            serviceName={service.title}
            providerName={service.publisher?.full_name || 'مقدم الخدمة'}
            email={service.email}
            phone={service.phone}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedServiceCard;