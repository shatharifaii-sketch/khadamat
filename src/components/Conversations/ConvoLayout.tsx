import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Separator } from '../ui/separator'
import { useTranslation } from 'react-i18next'

interface Props {
    children: React.ReactNode
}

const ConvoLayout = ({ children }: Props) => {
    const { t } = useTranslation("chat");
    const lang = localStorage.getItem("language") || "en";

    return (
        <div className='flex gap-5 justify-center items-center my-5 text-start' dir={lang === "ar" ? "rtl" : "ltr"}>
            <Card className='w-full shadow-none md:w-3/5 md:shadow-sm flex flex-col gap-5'>
                <CardHeader className='text-2xl font-semibold'>
                    {t("convos_title")}
                </CardHeader>
                <Separator />
                <CardContent className='px-3 overflow-y-auto max-h-[500px] min-h-[400px]'>
                    {children}
                </CardContent>
            </Card>
        </div>
    )
}

export default ConvoLayout