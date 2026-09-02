import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ServiceStatusIndicatorProps {
  status: string;
  views?: number;
  isNewlyPublished?: boolean;
}

const ServiceStatusIndicator = ({ status, views = 0, isNewlyPublished = false }: ServiceStatusIndicatorProps) => {
  const { t } = useTranslation("account");
  const lang = localStorage.getItem("language") || "en";

  const getStatusConfig = () => {
    switch (status) {
      case 'published':
        return {
          icon: CheckCircle,
          label: t("service_card.published"),
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case 'draft':
        return {
          icon: Clock,
          label: t("service_card.draft"),
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        };
      case 'pending':
        return {
          icon: Clock,
          label: t("service_card.pending"),
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        };
      case 'pending-approval':
        return {
          icon: Clock,
          label: t("service_card.pending-approval"),
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        };
      default:
        return {
          icon: AlertCircle,
          label: t("service_card.unknown"),
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
    }
  };

  const { icon: Icon, label, className } = getStatusConfig();

  return (
    <div className="flex items-center gap-2 text-start" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Badge className={`${className} flex items-center gap-2`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
      
      {isNewlyPublished && (
        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground animate-pulse">
          {t("service_card.badge_new")}!
        </Badge>
      )}
    </div>
  );
};

export default ServiceStatusIndicator;