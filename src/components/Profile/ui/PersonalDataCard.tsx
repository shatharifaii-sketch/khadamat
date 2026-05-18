import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Props {
    description: string;
    joinedAt: string;
    location: string;
    experienceYears: number;
}

const PersonalDataCard = ({
    description,
    joinedAt,
    location,
    experienceYears
}) => {
    const { t } = useTranslation("profile");
    const lang = localStorage.getItem("language") || "ar";
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("description")}</CardTitle>
                <CardDescription className='text-muted-foreground border border-gray-100 rounded-lg p-4 text-lg'>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent dir={lang === "ar" ? "rtl" : "ltr"}>
                <div className='flex items-center justify-between'>
                    <div className='flex justify-start gap-5'>
                        <div className='flex items-center justify-start gap-5'>
                            <CardTitle className='text-md'>{t("location")}:</CardTitle>
                            <CardDescription className={cn(location && 'text-primary text-lg', !location && 'text-muted-foreground')}>
                                {t(location) || t("not_specified")}
                            </CardDescription>
                        </div>
                        <Separator orientation='vertical' className='h-6' />
                        <div className='flex items-center justify-start gap-5'>
                            <CardTitle className='text-md'
                            >
                                {t("experience_years")}:
                            </CardTitle>
                            <CardDescription className={cn(location && 'text-primary text-lg', !location && 'text-muted-foreground')}>
                                {experienceYears || t("not_specified")}
                            </CardDescription>
                        </div>
                    </div>
                    <div className='flex items-center justify-start gap-5'>
                            <CardTitle className='text-sm text-muted-foreground/70'>{t("joined_at")}:</CardTitle>
                            <CardDescription className='text-primary text-md'>
                                {joinedAt.split('T')[0]}
                            </CardDescription>
                        </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PersonalDataCard