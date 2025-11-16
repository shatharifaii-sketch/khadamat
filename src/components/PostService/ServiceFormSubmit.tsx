
import { Button } from '@/components/ui/button';
import { Suspense, useEffect, useState } from 'react';
import SubscriptionsModal from './SubscriptionsModal';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter } from '../ui/drawer';
import ErrorBoundary from '../ErrorBoundary';
import { useServiceForm } from '@/hooks/useServiceForm';
import PaymentModal from './PaymentModal';

interface ServiceFormSubmitProps {
  isCreating: boolean;
  canPostService: boolean;
  isEditMode?: boolean;
  savePendingService?: () => void;
}

const ServiceFormSubmit = ({ isCreating, canPostService: editMode, isEditMode = false, savePendingService }: ServiceFormSubmitProps) => {
  const [openSubscribeModal, setOpenSubscribeModal] = useState<boolean>(false);
  const { canPostServiceAsync } = useServiceForm();
  const [sub, setSub] = useState<boolean>(false);
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    const checkCanPost = async () => {
      setSub(canPostServiceAsync.subscription);
      setAllowed(canPostServiceAsync.canPost);
    }

    checkCanPost();
  }, [canPostServiceAsync]);

  return (
    <div className="pt-6">
      <Button
        type={isEditMode || allowed ? 'submit' : 'button'}
        size="lg"
        className="w-full text-xl py-6"
        disabled={isCreating}
        onClick={() => {
          if (!editMode && !allowed) {
            savePendingService();
            setOpenSubscribeModal(true);
            return;
          }
        }}
      >
        {isCreating ?
          (isEditMode ? 'جاري التحديث...' : 'جاري النشر...')
          :
          (isEditMode ? 'حفظ التعديلات' : allowed && sub ? 'انشر الخدمة' : 'اشترك أو إدفع الان و انشر الخدمة')
        }
      </Button>
      {!isEditMode && !sub && !allowed && (
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
          <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              {(!allowed && !sub) || (allowed && !sub) && <SubscriptionsModal />}
              {!allowed && sub && <PaymentModal />}
            </ErrorBoundary>
          </Suspense>
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
