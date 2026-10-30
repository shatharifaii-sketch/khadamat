
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface ServiceFormHeaderProps {
  isEditMode: boolean;
  hasPendingService: boolean;
}

const ServiceFormHeader = ({ isEditMode, hasPendingService }: ServiceFormHeaderProps) => {
  const { t } = useTranslation("services");
  return (
    <CardHeader>
      <CardTitle className="text-xl md:text-2xl">
        {isEditMode ? t("post_service.service_details_edit") : t("post_service.service_details")}
      </CardTitle>
      <CardDescription className="text-large">
        {isEditMode ? t("post_service.edit_service_description") : t("post_service.post_service_inner_description")}
        {hasPendingService && !isEditMode && (
          <span className="block mt-2 text-green-600 font-medium">
            ✓ {t("post_service.pending_service_notice")}
          </span>
        )}
      </CardDescription>
    </CardHeader>
  );
};

export default ServiceFormHeader;
