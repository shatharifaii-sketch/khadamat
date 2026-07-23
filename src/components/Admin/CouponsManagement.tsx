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
import { useTranslation } from 'react-i18next';

interface Props {
    coupons: Tables<'coupons'>[];
}

type SortOption = "code-name" | "date-asc" | "date-desc";

const CouponsManagement = ({ coupons }: Props) => {
    const { t } = useTranslation("admin");
    const lang = localStorage.getItem("language") || "en";

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
                title: t("table.coupons_management.toasts.deleted_title"),
                description: t("table.coupons_management.toasts.deleted_description"),
            });
        } catch (error: any) {
            toast({
                title: t("table.coupons_management.toasts.error_title"),
                description: error.message || t("table.coupons_management.toasts.error_description"),
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader className='flex flex-col gap-3'>
                <div className="flex items-center justify-between">
                    <CardTitle>{t("table.coupons_management.title")}</CardTitle>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                {t("table.coupons_management.create_coupon")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{t("table.coupons_management.create_coupon_title")}</DialogTitle>
                            </DialogHeader>
                            <CouponForm closeForm={() => setIsCreateModalOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder={t("table.coupons_management.sort.label")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel className='text-right px-3 text-muted-foreground'>{t("table.coupons_management.sort.label")}</SelectLabel>
                            <SelectItem value="date-desc">{t("table.coupons_management.sort.newest")}</SelectItem>
                            <SelectItem value="date-asc">{t("table.coupons_management.sort.oldest")}</SelectItem>
                            <SelectItem value="code-name">{t("table.coupons_management.sort.code")}</SelectItem> 
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='text-end'>{t("table.coupons_management.table.code")}</TableHead>
                            <TableHead className='text-end'>{t("table.coupons_management.table.type")}</TableHead>
                            <TableHead className='text-end'>{t("table.coupons_management.table.fixed_value")}</TableHead>
                            <TableHead className='text-end'>{t("table.coupons_management.table.percentage")}</TableHead>
                            <TableHead className='text-end'>{t("table.coupons_management.table.usage_limit")}</TableHead>
                            <TableHead className='text-end'>{t("table.coupons_management.table.status")}</TableHead>
                            {/* <TableHead className='text-end'>الوصف</TableHead> */}
                            <TableHead className='text-end'>{t("table.coupons_management.table.used_count")}</TableHead>
                            <TableHead className='text-end'>{t("table.coupons_management.table.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedCoupons.map((coupon) => (
                            <TableRow key={coupon.id}>
                                <TableCell className="font-medium max-w-xs truncate">
                                    {coupon.code}
                                </TableCell>
                                <TableCell>{coupon.type}</TableCell>
                                <TableCell>{coupon.discount_amount || t("table.coupons_management.empty.value")}</TableCell>
                                <TableCell>{coupon.discount_percentage || t("table.coupons_management.empty.value")}</TableCell>
                                <TableCell>
                                    {coupon.usage_limit || t("table.coupons_management.empty.value")}
                                </TableCell>
                                <TableCell>
                                    {coupon.active ? <Badge className='bg-green-100 text-green-800'>{t("table.coupons_management.status.active")}</Badge> : <Badge className='bg-red-100 text-red-800'>{t("table.coupons_management.status.inactive")}</Badge>}
                                </TableCell>
                                {/* <TableCell>
                                    {coupon.description || 'لا يوجد'}
                                </TableCell> */}
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
                                                    <AlertDialogTitle>{t("table.coupons_management.dialogs.delete_title")}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t("table.coupons_management.dialogs.delete_description", { code: coupon.code })}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        {t("table.coupons_management.dialogs.cancel")}
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id)} className="bg-destructive text-destructive-foreground">
                                                        {t("table.coupons_management.dialogs.confirm_delete")}
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