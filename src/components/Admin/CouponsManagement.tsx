import { UserProfile } from '@/hooks/useProfile';
import { Tables } from '@/integrations/supabase/types'
import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import CouponForm from './ui/CouponForm';
import { useAdminFunctionality } from '@/hooks/useAdminFunctionality';

interface Props {
    coupons: Tables<'coupons'>[];
}

type SortOption = "code-name" | "date-asc" | "date-desc";

const CouponsManagement = ({ coupons }: Props) => {
    const { toast } = useToast();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');
    const { deleteCoupon } = useAdminFunctionality();

    const sortedCoupons = useMemo(() => {
        if (!coupons) return [];
        return [...coupons].sort((a, b) => {
            if (sortOption === "date-desc") {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sortOption === "code-name") {
                return a.code.localeCompare(b.code, 'en', { sensitivity: 'base' });
            } else if (sortOption === "date-asc") {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
        });
    }, [coupons, sortOption]);

    const handleDeleteCoupon = async (couponId: string) => {
        try {
            deleteCoupon.mutateAsync(couponId);

            toast({
                title: "تم الحذف",
                description: "تم حذف الخدمة بنجاح",
            });
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.message || "حدث خطأ أثناء حذف الخدمة",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader className='flex flex-col gap-3'>
                <div className="flex items-center justify-between">
                    <CardTitle>إدارة الكوبونات</CardTitle>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                إنشاء كوبون جديد
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>إنشاء خدمة جديدة</DialogTitle>
                            </DialogHeader>
                            <CouponForm closeForm={() => setIsCreateModalOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder="ترتيب حسب التاريخ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel className='text-right px-3 text-muted-foreground'>ترتيب حسب</SelectLabel>
                            <SelectItem value="date-desc">الأحدث</SelectItem>
                            <SelectItem value="date-asc">الأقدم</SelectItem>
                            <SelectItem value="code-name">نص الكوبون</SelectItem> 
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='text-end'>العنوان</TableHead>
                            <TableHead className='text-end'>النوع</TableHead>
                            <TableHead className='text-end'>القيمة المحددة</TableHead>
                            <TableHead className='text-end'>النسبة المئوية</TableHead>
                            <TableHead className='text-end'>حد الاستخدام</TableHead>
                            <TableHead className='text-end'>الحالة</TableHead>
                            <TableHead className='text-end'>الوصف</TableHead>
                            <TableHead className='text-end'>مرات الاستخدام</TableHead>
                            <TableHead className='text-end'>إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedCoupons.map((coupon) => (
                            <TableRow key={coupon.id}>
                                <TableCell className="font-medium max-w-xs truncate">
                                    {coupon.code}
                                </TableCell>
                                <TableCell>{coupon.type}</TableCell>
                                <TableCell>{coupon.discount_amount || 'غير محدد'}</TableCell>
                                <TableCell>{coupon.discount_percentage || 'غير محدد'}</TableCell>
                                <TableCell>
                                    {coupon.usage_limit || 'غير محدد'}
                                </TableCell>
                                <TableCell>
                                    {coupon.active ? <Badge className='bg-green-100 text-green-800'>فعال</Badge> : <Badge className='bg-red-100 text-red-800'>متوقف</Badge>}
                                </TableCell>
                                <TableCell>
                                    {coupon.description || 'لا يوجد'}
                                </TableCell>
                                <TableCell>
                                    {coupon.used_count || 0}
                                </TableCell>
                                <TableCell className='flex justify-center'>
                                    <div className="flex gap-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive">
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        هل أنت متأكد من حذف الكوبون "{coupon.code}"؟ هذا الإجراء لا يمكن التراجع عنه.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id)} className="bg-destructive text-destructive-foreground">
                                                        حذف
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default CouponsManagement