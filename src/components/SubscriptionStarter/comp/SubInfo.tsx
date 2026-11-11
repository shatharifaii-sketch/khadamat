import { Badge } from '@/components/ui/badge';
import { Subscription } from '@/hooks/useSubscription';
import { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import React from 'react'
import { useTranslation } from 'react-i18next';

interface Props {
    subscription: Tables<'subscription_tiers'>;
    cycle: string
}

const SubInfo = ({subscription, cycle}: Props) => {
    const { t } = useTranslation("subscriptions");
    const lang = localStorage.getItem("language") || "en";

  return (
    <div className="flex flex-col gap-3 w-[400px]"
              dir={lang === "ar" ? "rtl" : "ltr"}>
              <h1 className="text-2xl font-semibold">{t("starter.tier_data")}</h1>
              <div className='flex flex-col gap-4'>
                <h1 className='text-xl font-semibold border-4 border-dotted rounded-lg p-2 border-primary text-primary text-center px-5'>{subscription.title}</h1>
                <div>
                  <div className={cn('border-2 border-dashed rounded-lg p-2', subscription.class_name)}>
                    <span className={cn('flex items-center gap-2', subscription.class_name)}>
                      {t("important_points")}
                    </span>
                    <ul className='list-disc list-inside'>
                      {lang === "ar" && (subscription.notes as [] ?? []).map((note: string) => (
                        <li className='text-start' key={note}>{note}</li>
                      ))}
                      {lang === "en" && (subscription.notes_english as [] ?? []).map((note: string) => (
                        <li className='text-start' key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                  <p>{t("starter.tier_description")}</p>
                  <div className='mt-4'>
                    <Badge className={cn('text-lg rounded-md', subscription.badge_class_name)}>
                      {cycle === 'yearly' ?
                        `${subscription.price_yearly_value} ${t("yearly_ils")}`
                        :
                        `${subscription.price_monthly_value} ${t("monthly_ils")}`
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
  )
}

export default SubInfo