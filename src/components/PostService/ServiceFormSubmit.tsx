
import { Button } from '@/components/ui/button';

interface ServiceFormSubmitProps {
  isCreating: boolean;
  canPostService: boolean;
}

const ServiceFormSubmit = ({ isCreating, canPostService }: ServiceFormSubmitProps) => {
  return (
    <div className="pt-6">
      <Button 
        type="submit" 
        size="lg" 
        className="w-full text-xl py-6"
        disabled={isCreating}
      >
        {isCreating ? 'جاري النشر...' : 
         canPostService ? 'انشر الخدمة' : 'ادفع وانشر الخدمة (10 شيكل)'}
      </Button>
      {!canPostService && (
        <p className="text-center text-muted-foreground mt-4 text-large">
          سيتم توجيهك لصفحة الدفع أولاً
        </p>
      )}
    </div>
  );
};

export default ServiceFormSubmit;
