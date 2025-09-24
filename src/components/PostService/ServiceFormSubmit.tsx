
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog';
import { useState } from 'react';
import SubscriptionsModal from './SubscriptionsModal';

interface ServiceFormSubmitProps {
  isCreating: boolean;
  canPostService: boolean;
  isEditMode?: boolean;
}

const ServiceFormSubmit = ({ isCreating, canPostService, isEditMode = false }: ServiceFormSubmitProps) => {
  const [openSubscribeModal, setOpenSubscribeModal] = useState<boolean>(false);
  return (
    <div className="pt-6">
      <Button
        type="submit"
        size="lg"
        className="w-full text-xl py-6"
        disabled={isCreating}
        onClick={() => !canPostService && setOpenSubscribeModal(true)}
      >
        {isCreating ?
          (isEditMode ? 'جاري التحديث...' : 'جاري النشر...') :
          (isEditMode ? 'حفظ التعديلات' :
            canPostService ? 'انشر الخدمة' : (
              <Dialog
                open={openSubscribeModal}
                onOpenChange={setOpenSubscribeModal}
              >
                <DialogTrigger>
                  <span>اشترك الان و انشر الخدمة</span>
                </DialogTrigger>
                <DialogContent className='max-w-3xl'>
                  <SubscriptionsModal closeModal={() => setOpenSubscribeModal(false)} />
                </DialogContent>
              </Dialog>
            ))
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
