
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ServiceFormHeaderProps {
  isEditMode: boolean;
  hasPendingService: boolean;
}

const ServiceFormHeader = ({ isEditMode, hasPendingService }: ServiceFormHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">
        {isEditMode ? 'تعديل الخدمة' : 'تفاصيل الخدمة'}
      </CardTitle>
      <CardDescription className="text-large">
        {isEditMode ? 'قم بتعديل معلومات خدمتك' : 'املأ المعلومات التالية لنشر خدمتك'}
        {hasPendingService && !isEditMode && (
          <span className="block mt-2 text-green-600 font-medium">
            ✓ تم استرداد بياناتك المحفوظة
          </span>
        )}
      </CardDescription>
    </CardHeader>
  );
};

export default ServiceFormHeader;
