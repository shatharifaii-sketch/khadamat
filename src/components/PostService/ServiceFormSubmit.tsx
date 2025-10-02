
import { Button } from '@/components/ui/button';
import { Suspense, useState } from 'react';
import SubscriptionsModal from './SubscriptionsModal';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '../ui/drawer';
import ErrorBoundary from '../ErrorBoundary';
import { usePendingService } from '@/hooks/usePendingService';
import { ServiceFormData } from '@/types/service';

interface ServiceFormSubmitProps {
  isCreating: boolean;
  canPostService: boolean;
  isEditMode?: boolean;
  savePendingService?: () => void;
}

const ServiceFormSubmit = ({ isCreating, canPostService, isEditMode = false, savePendingService }: ServiceFormSubmitProps) => {
  const [openSubscribeModal, setOpenSubscribeModal] = useState<boolean>(false);

  
  return (
    <div className="pt-6">
      <Button
        type={isEditMode || canPostService ? 'submit' : 'button'}
        size="lg"
        className="w-full text-xl py-6"
        disabled={isCreating}
        onClick={() => {
          if (!canPostService) {
            savePendingService();
            setOpenSubscribeModal(true);
          }
        }}
      >
        {isCreating ?
          (isEditMode ? 'جاري التحديث...' : 'جاري النشر...') :
          (isEditMode ? 'حفظ التعديلات' :
            canPostService ? 'انشر الخدمة' : 'اشترك الان و انشر الخدمة')
        }
      </Button>
      {!canPostService && !isEditMode && (
        <p className="text-center text-muted-foreground mt-4 text-large">
          سيتم توجيهك لصفحة الدفع أولاً
        </p>
      )}

      <Drawer
        direction='right'
        open={openSubscribeModal}
        onOpenChange={() => setOpenSubscribeModal(false)}
      >
        <DrawerContent className='h-screen w-full sm:w-4/5 lg:w-2/5 transition-all rounded-none'>
          <DrawerHeader className='flex items-center justify-between'>
            <DrawerTitle className='text-2xl text-start'>
              أنواع الاشتراك
            </DrawerTitle>
          </DrawerHeader>
          <DrawerDescription className='flex flex-col gap-4 px-5 overflow-y-auto'>
            <div>
              <p>يجب على جميع الاشتراك بأحد العروض المتوفرة للحصول على قدرة نشر الخدمات</p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <SubscriptionsModal />
              </ErrorBoundary>
            </Suspense>
          </DrawerDescription>
          <DrawerFooter>
            <DrawerClose className='flex'>
              <Button variant='ghost' className='flex-1'>إلغاء</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ServiceFormSubmit;
