import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';

interface ServiceStatusIndicatorProps {
  status: string;
  views?: number;
  isNewlyPublished?: boolean;
}

const ServiceStatusIndicator = ({ status, views = 0, isNewlyPublished = false }: ServiceStatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'published':
        return {
          icon: CheckCircle,
          label: 'منشورة',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case 'draft':
        return {
          icon: Clock,
          label: 'مسودة',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'في الانتظار',
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'غير معروف',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
    }
  };

  const { icon: Icon, label, className } = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <Badge className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
      
      {isNewlyPublished && (
        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground animate-pulse">
          جديد!
        </Badge>
      )}
      
      {status === 'published' && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Eye className="w-3 h-3 mr-1" />
          {views} مشاهدة
        </div>
      )}
    </div>
  );
};

export default ServiceStatusIndicator;