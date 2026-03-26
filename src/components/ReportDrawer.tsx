import { useEffect, useState } from "react";
import { Button } from "./ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer"
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useEmail } from "@/hooks/useEmail";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { MailCheck } from "lucide-react";

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
            toast.error('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
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

                toast.success('تم تقديم البلاغ بنجاح');
                setOpenDrawer(false);
            }
    }, [sendReportEmail.isSuccess, sendReportEmail.mutateAsync])


    return (
        <>
            <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="">
                        قدم شكوى
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="px-5 flex flex-col items-center justify-center">
                    <DrawerHeader className="">
                        <DrawerTitle className="text-2xl text-center">قدم تقرير</DrawerTitle>
                        <p className="text-center">يتم تقديم تقرير عن {itemType === 'service' ? 'خدمة' : 'مستخدم'} باسم {itemLabel}</p>
                    </DrawerHeader>
                    <DrawerDescription className="mb-5">
                        قدم شرح مفصل لسبب تقريرك وماذا تريد من المساعدة.
                    </DrawerDescription>
                    <div className="w-1/2">
                        <div>
                            <Label>الاسم الكامل</Label>
                            <Input 
                            className="mt-2 placeholder:opacity-50 mb-4 text-black" 
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="اكتب هنا..." />
                        </div>
                        <div>
                            <Label>البريد الالكتروني</Label>
                            <Input 
                            className="mt-2 placeholder:opacity-50 mb-4 text-black"
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="اكتب هنا..." />
                        </div>
                        <div>
                            <Label>رقم الجوال</Label>
                            <Input className="mt-2 placeholder:opacity-50 mb-4 text-black"
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="اكتب هنا..." />
                        </div>
                        <div>
                            <Label>الشكوى</Label>
                            <Textarea className="mt-2 placeholder:opacity-50 mb-4 text-black"
                            onChange={(e) => handleInputChange('report_message', e.target.value)} placeholder="اكتب هنا..." rows={5} />
                        </div>
                    </div>
                    <DrawerFooter className="w-2/5">
                        <Button 
                        onClick={handleSubmit}
                        disabled={sendReportEmail.isPending}
                        className="w-full"
                        >ارسل الشكوى</Button>
                        <Button variant="outline" className="w-full">الغاء</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            <Dialog open={openEmailDialog} onOpenChange={setOpenEmailDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تم ارسال الرسالة بنجاح</DialogTitle>
                        <DialogDescription>
                            سيتم التواصل معك قريبا
                        </DialogDescription>
                    </DialogHeader>
                    <p className='flex gap-2 items-center'>
                        شكرا لتواصلك معنا!
                        <MailCheck size={16} />
                    </p>
                    <DialogFooter>
                        <Button onClick={() => setOpenEmailDialog(false)}>حسنا</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ReportDrawer