import ErrorBoundary from '@/components/ErrorBoundary';
import StarterWrapper from '@/components/SubscriptionStarter/StarterWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionTierData } from '@/hooks/useSubscriptionTiers';
import { cn } from '@/lib/utils';
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const SubscriptionStarter = () => {
  const { t } = useTranslation("subscriptions");
  const lang = localStorage.getItem("language") || "en";

  const { tier_id, cycle } = useParams();
  const { user } = useAuth();

  if (!user) {
    toast.error(t("login_required"));
    return <Navigate to="/auth" />
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <StarterWrapper tier_id={tier_id} cycle={cycle} />
      </ErrorBoundary>
    </Suspense>
  )
}

export default SubscriptionStarter