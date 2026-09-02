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
    <div ref={ref} className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Icon className="w-10 h-10 text-primary" />
        </div>

        <div className="text-3xl font-bold mb-2">
            {value === 0 ? t("stats.soon") : count}
        </div>

        <div className="text-lg text-muted-foreground">
            {label}
        </div>
    </div>
  )
}

export default StatCard