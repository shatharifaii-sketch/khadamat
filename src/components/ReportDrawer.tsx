import { Button } from "./ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer"
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

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
    return (
        <Drawer>
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
                            <Input className="mt-2 placeholder:opacity-50 mb-4 text-black" placeholder="اكتب هنا..." />
                        </div>
                        <div>
                            <Label>البريد الالكتروني</Label>
                            <Input className="mt-2 placeholder:opacity-50 mb-4 text-black" placeholder="اكتب هنا..." />
                        </div>
                        <div>
                            <Label>رقم الجوال</Label>
                            <Input className="mt-2 placeholder:opacity-50 mb-4 text-black" placeholder="اكتب هنا..." />
                        </div>
                        <div>
                            <Label>الشكوى</Label>
                            <Textarea className="mt-2 placeholder:opacity-50 mb-4 text-black" placeholder="اكتب هنا..." rows={5} />
                        </div>
                </div>
                <DrawerFooter className="w-2/5">
                    <Button className="w-full">ارسل الشكوى</Button>
                    <Button variant="outline" className="w-full">الغاء</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default ReportDrawer