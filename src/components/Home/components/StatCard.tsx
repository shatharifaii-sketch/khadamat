import { useCountUp } from '@/hooks/useCountUp';
import { LucideIcon } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next';

interface Props {
    icon: LucideIcon;
    value: number;
    label: string;
}

const StatCard = ({
    icon: Icon,
    value,
    label
}: Props) => {
    const { t } = useTranslation("home");
    const { ref, count } = useCountUp(value);

  return (
    <div ref={ref} className="text-center flex flex-col items-center justify-center gap-2">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white rounded-full">
            <Icon className="size-7 md:size-10 text-primary" />
        </div>

        <div className="text-xl md:text-3xl font-bold">
            {value === 0 ? t("stats.soon") : count}
        </div>

        <div className="text-md md:text-lg text-muted-foreground">
            {label}
        </div>
    </div>
  )
}

export default StatCard