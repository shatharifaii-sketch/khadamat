import { useEffect, useState } from "react";
import { Button } from "./ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer"
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useEmail } from "@/hooks/useEmail";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Flag, MailCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ReportProps {
    itemId: string;
    itemType: string;
    itemLabel: string;
}

const ReportDrawer = ({
    itemId,
    itemType,
    itemLabel
}: ReportProps) => {
    const { t } = useTranslation("services");
    const lang = localStorage.getItem("language") || "en"
    const isMobile = useIsMobile();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        report_message: '',
        object_type: itemType,
        object_id: itemId
    });
    const { sendReportEmail } = useEmail();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openEmailDialog, setOpenEmailDialog] = useState(false);


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await sendReportEmail.mutateAsync(formData);
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error(t("service.report.toast_error"));
        }
    };

    useEffect(() => {
        if (sendReportEmail.isSuccess) {
            setOpenEmailDialog(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                report_message: '',
                object_type: itemType,
                object_id: itemId
            });

            toast.success(t("service.report.toast_success"));
            setOpenDrawer(false);
        }
    }, [itemId, itemType, sendReportEmail.isSuccess, sendReportEmail.mutateAsync, t])


    return (
        <>
            <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="max-w-full">
                        <Flag />
                        <span className={cn(isMobile ? "hidden" : "block")}>{t("service.report.report_button")}</span>
                    </Button>
                </DrawerTrigger>
                <DrawerContent className={cn(
                    "px-5 flex flex-col items-center justify-start",
                    isMobile ? "h-5/6" : ""
                    )}>
                    <DrawerHeader>
                        <DrawerTitle className="text-lg md:text-2xl text-center">{t("service.report.submit_report")}</DrawerTitle>
                        <p className="text-center text-xs md:text-md">
                            {t(
                                "service.report.report_drawer_description", 
                                { 
                                    itemType: 
                                        itemType === 'service' 
                                        ? lang == "en" ? "service" : "خدمة" 
                                        : lang == "en" ? "user" : "مستخدم", 
                                    itemLabel 
                                })}
                            </p>
                    </DrawerHeader>
                    <DrawerDescription className="mb-5 text-xs md:text-md">
                        {t("service.report.report_drawer_placeholder")}
                    </DrawerDescription>
                    <div className={cn(
                        "w-full md:w-1/2 overflow-y-auto",
                        isMobile ? "max-h-[250px]" : ""
                        )}>
                        <div>
                            <Label>{t("service.report.report_drawer_name")}</Label>
                            <Input
                                className="mt-2 placeholder:opacity-50 mb-4 text-black"
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder={t("service.report.report_drawer_input_placeholder")} />
                        </div>
                        <div>
                            <Label>{t("service.report.report_drawer_email")}</Label>
                            <Input
                                className="mt-2 placeholder:opacity-50 mb-4 text-black"
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder={t("service.report.report_drawer_input_placeholder")} />
                        </div>
                        <div>
                            <Label>{t("service.report.report_drawer_phone")}</Label>
                            <Input className="mt-2 placeholder:opacity-50 mb-4 text-black"
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder={t("service.report.report_drawer_input_placeholder")} />
                        </div>
                        <div>
                            <Label>{t("service.report.report_message")}</Label>
                            <Textarea className="mt-2 placeholder:opacity-50 mb-4 text-black"
                                onChange={(e) => handleInputChange('report_message', e.target.value)} placeholder={t("service.report.report_drawer_input_placeholder")} rows={5} />
                        </div>
                    </div>
                    <DrawerFooter className={cn(
                        "w-full md:w-2/5",
                        isMobile ? "pb-10" : ""
                        )}>
                        <Button
                            onClick={handleSubmit}
                            disabled={sendReportEmail.isPending}
                            className="w-full"
                        >{t("service.report.submit_button")}</Button>
                        <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setOpenDrawer(false)}
                        >
                            {t("service.report.cancel_button")}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            <Dialog open={openEmailDialog} onOpenChange={setOpenEmailDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("service.report.dialog_title")}</DialogTitle>
                        <DialogDescription>
                            {t("service.report.dialog_description")}
                        </DialogDescription>
                    </DialogHeader>
                    <p className='flex gap-2 items-center'>
                        شكرا لتواصلك معنا!
                        <MailCheck size={16} />
                    </p>
                    <DialogFooter>
                        <Button onClick={() => setOpenEmailDialog(false)}>{t("service.report.dialog_button")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ReportDrawer