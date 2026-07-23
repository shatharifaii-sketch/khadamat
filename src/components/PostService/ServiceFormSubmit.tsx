import { Button } from '@/components/ui/button';
import { Suspense, useEffect, useState } from 'react';
import SubscriptionsModal from './SubscriptionsModal';
import { Drawer, DrawerContent } from '../ui/drawer';
import ErrorBoundary from '../ErrorBoundary';
import { useServiceForm } from '@/hooks/useServiceForm';
import PaymentModal from './PaymentModal';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ServiceFormSubmitProps {
  isCreating: boolean;
  canPostService: boolean;
  isEditMode?: boolean;
  savePendingService?: () => void;
}

const ServiceFormSubmit = ({ isCreating, canPostService: editMode, isEditMode = false, savePendingService }: ServiceFormSubmitProps) => {
  const { t } = useTranslation("services");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openSubscribeModal, setOpenSubscribeModal] = useState<boolean>(false);
  const { canPostServiceAsync } = useServiceForm();
  const [sub, setSub] = useState<boolean>(false);
  const [allowed, setAllowed] = useState<boolean>(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isEditMode && canPostServiceAsync) {
      setSub(!!canPostServiceAsync.subscription);
      setAllowed(!!canPostServiceAsync.canPost);
      setIsReady(true);
    }
  }, [canPostServiceAsync, isEditMode]);

  return (
    <div className="pt-6">
      <Button
        type={isEditMode || allowed ? 'submit' : 'button'}
        size="lg"
        className="w-full text-xl py-6"
        disabled={isCreating}
        onClick={() => {
          if (isReady && !sub) {
            setOpenSubscribeModal(true);
          }
          if (!allowed && sub) {
            navigate('/account');
          }
        }}
      >
        {isCreating ?
          (isEditMode ? t("post_service.updating") : t("post_service.publishing"))
          :
          (isEditMode 
            ? t("post_service.save_changes") 
            : allowed && sub 
              ? t("post_service.publish_service") 
              : !allowed && sub 
                ? t("post_service.get_extra_service")
                : !sub ? t("post_service.get_subscription") : t("post_service.not_allowed_to_post"))
        }
      </Button>

      <Drawer
        direction='bottom'
        open={openSubscribeModal}
        onOpenChange={setOpenSubscribeModal}
      >
        <DrawerContent className=' transition-all rounded-none'>
          <DialogTitle></DialogTitle>
          <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              <SubscriptionsModal user={user} setDrawerOpen={setOpenSubscribeModal} />
            </ErrorBoundary>
          </Suspense>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ServiceFormSubmit;
