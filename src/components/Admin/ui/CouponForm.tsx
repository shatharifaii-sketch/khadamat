import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useAdminFunctionality } from "@/hooks/useAdminFunctionality";

interface Props {
    closeForm: () => void
}

const couponTypes = [
    {
        label: 'percentage',
        value: 'نسبة مئوية'
    },
    {
        label: 'fixed',
        value: 'قيمة ثابتة'
    },
    {
        label: "first_month_free",
        value: "الشهر الأول مجاناً"
    },
    {
        label: "three_months_for_one",
        value: "الاشهر الثلائة الاولى مجاناً"
    }
];

const CouponForm = ({ closeForm }: Props) => {
    const { createCoupon, createCouponSuccess } = useAdminFunctionality();

    const [formData, setFormData] = useState({
        code: '',
        type: null,
        discount_amount: null,
        discount_percentage: null,
        usage_limit: null,
        description: '',
        expires_at: null,
    });

    useEffect(() => {
  if (createCouponSuccess) {
    closeForm();
  }
}, [createCouponSuccess, closeForm]);

    const handleSubmit = () => {
        console.log(formData);

        createCoupon.mutate(formData);
    }

    return (
        <div className="space-y-4">

            <div className="flex flex-col overflow-y-scroll h-[510px] space-x-2 pr-3">
                <div className="ml-2">
                    <Label htmlFor="code">نص الكوبون</Label>
                    <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                </div>
                <div>
                        <Label htmlFor="type">الفئة</Label>
                        <Select value={formData.type || ''} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                            <SelectContent>
                                {couponTypes.map((type, index) => (
                                    <SelectItem key={index} value={type.label}>
                                        {type.value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="discount_amount">القيمة الثابتة</Label>
                        <Input
                            id="discount_amount"
                            value={formData.discount_amount || 0}
                            onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                            type="number"
                            min={0}
                            disabled={formData.type === 'percentage'}
                        />
                    </div>

                    <div>
                        <Label htmlFor="discount_percentage">النسبة المئوية</Label>
                        <Input
                            id="discount_percentage"
                            value={formData.discount_percentage || 0}
                            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                            type="number"
                            min={0}
                            max={100}
                            disabled={formData.type !== 'percentage'}
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">الوصف</Label>
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <Label htmlFor="usage_limit">مرات الاستخدام المسموحة</Label>
                        <Input
                            id="usage_limit"
                            value={formData.usage_limit || ''}
                            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                            min={1}
                        />
                    </div>

                    <div>
                        <Label htmlFor="expires_at">تاريخ الانتهاء</Label>
                        <Input
                            id="expires_at"
                            type="date"
                            value={formData.expires_at || ''}
                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    </div>


            </div>

            <Button
                onClick={() => handleSubmit()}
                className="w-full"
            >
                إنشاء الكوبون
            </Button>
        </div>
    )
};

export default CouponForm;