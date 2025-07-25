import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Eye, Star, MessageCircle, ExternalLink, Heart } from 'lucide-react';
import { useServiceViews } from '@/hooks/useServiceViews';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { categories } from '@/components/FindService/ServiceCategories';
import type { PublicService } from '@/hooks/usePublicServices';

interface EnhancedServiceCardProps {
  service: PublicService;
}

const EnhancedServiceCard = ({ service }: EnhancedServiceCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const { incrementView } = useServiceViews();
  const { createConversation, isCreating } = useConversations();
  const { user } = useAuth();

  const categoryLabel = categories.find(cat => cat.value === service.category)?.label || service.category;

  const handleViewService = () => {
    incrementView(service.id);
  };

  const handleContactProvider = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للتواصل مع مقدم الخدمة');
      return;
    }

    try {
      await createConversation.mutateAsync({
        serviceId: service.id,
        providerId: service.user_id
      });
      toast.success('تم إنشاء المحادثة بنجاح!');
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'تم إلغاء الإعجاب' : 'تم الإعجاب بالخدمة');
  };

  return (
    <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-0 shadow-md hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {categoryLabel}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {service.title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`shrink-0 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <CardDescription className="text-sm line-clamp-3 text-right leading-relaxed">
          {service.description}
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
            <div className="flex items-center gap-1">
              <span>4.8</span>
              <Star className="h-3 w-3 fill-current text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={handleContactProvider}
            disabled={isCreating}
            className="flex-1 group"
          >
            {isCreating ? (
              'جاري الإنشاء...'
            ) : (
              <>
                <MessageCircle className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                تواصل الآن
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewService}
            className="group"
          >
            <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedServiceCard;