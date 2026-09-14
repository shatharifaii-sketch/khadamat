import { useSubscriptionTierData } from '@/hooks/useSubscriptionTiers';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import SubInfo from './comp/SubInfo';
import { useSubscription } from '@/hooks/useSubscription';

interface Props {
  tier_id: string;
  cycle: string;
}

const StarterWrapper = ({ tier_id, cycle }: Props) => {
  const { t } = useTranslation("subscriptions");
  const lang = localStorage.getItem("language") || "en";

  const { subscriptionTierData, subscriptionTierError, subscriptionTierIsPending, isSubscriptionTierError } = useSubscriptionTierData(tier_id);
  const { createNewSubscription, createNewSubscriptionError, creatingNewSubscription } = useSubscription();

  const amount = cycle === "yearly"
    ? subscriptionTierData.price_yearly_value
    : subscriptionTierData.price_monthly_value;

  const handleCreateNewSubscription = async () => {
    try {
      await createNewSubscription.mutateAsync({
        subscriptionTierId: tier_id,
        billingCycle: cycle,
        finalAmount: amount
      });
    } catch (error) {
      console.error('Error creating new subscription:', error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-start h-screen w-4/5 mx-auto gap-5 mt-10" dir={lang === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-4xl font-bold">{t("starter.title")}</h1>
      <Button
        className="text-xl font-semibold w-full md:w-1/2 border-4 border-dashed border-white outline outline-2 outline-offset-2 outline-primary mb-5 py-6"
        disabled={subscriptionTierIsPending || isSubscriptionTierError || creatingNewSubscription}
        onClick={handleCreateNewSubscription}
      >
        {t("starter.start_button")}
      </Button>
      <div className="flex flex-col md:flex-row items-center justify-start md:items-start md:justify-center gap-5 h-[600px] text-start" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="flex flex-col gap-3 w-[400px]" dir={lang === "ar" ? "rtl" : "ltr"}>
          <h1 className="text-2xl font-semibold">{t("starter.description")}</h1>
          <div>
            <p className="text-muted-foreground">
              <span className="font-bold text-primary">-</span> {t("starter.description_text", {
                amount,
                cycle: cycle === "yearly"
                  ? t("year")
                  : t("month"),
              })}
            </p>
            <p className="text-muted-foreground">
              <span className="font-bold text-primary">-</span> {t("starter.description_text_2")}
            </p>
          </div>
        </div>
        {/* Horizontal on mobile */}
        <Separator className="block md:hidden w-full" />

        {/* Vertical on desktop */}
        <Separator
          orientation="vertical"
          className="hidden md:block h-auto self-stretch"
        />

        <SubInfo subscription={subscriptionTierData} cycle={cycle} />
      </div>
    </div>
  )
}

export default StarterWrapper