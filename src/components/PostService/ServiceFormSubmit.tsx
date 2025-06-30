
import { Button } from '@/components/ui/button';

interface ServiceFormSubmitProps {
  isCreating: boolean;
  canPostService: boolean;
  isEditMode?: boolean;
}

const ServiceFormSubmit = ({ isCreating, canPostService, isEditMode = false }: ServiceFormSubmitProps) => {
  return (
    <div className="pt-6">
      <Button 
        type="submit" 
        size="lg" 
        className="w-full text-xl py-6"
        disabled={isCreating}
      >
        {isCreating ? 
          (isEditMode ? 'جاري التحديث...' : 'جاري النشر...') : 
          (isEditMode ? 'حفظ التعديلات' : 
           canPostService ? 'انشر الخدمة' : 'ادفع وانشر الخدمة (10 شيكل)')
        }
      </Button>
      {!canPostService && !isEditMode && (
        <p className="text-center text-muted-foreground mt-4 text-large">
          سيتم توجيهك لصفحة الدفع أولاً
        </p>
      )}
    </div>
  );
};

export default ServiceFormSubmit;
