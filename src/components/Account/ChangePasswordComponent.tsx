import React, { useEffect, useState } from 'react'
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

type FormError = {
    message: string,
    field: string
}

const ChangePasswordComponent = () => {
    const { changePassword } = useProfile();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<{ message: string, field: string }[]>([]);

    const validate = (): FormError[] => {
        const newErrors: FormError[] = [];

        if (!formData.newPassword) {
            newErrors.push({
                field: 'newPassword',
                message: 'كلمة المرور الجديدة مطلوبة'
            })
        }

        if (formData.newPassword.length < 6) {
            newErrors.push({
                field: 'newPassword',
                message: 'كلمة المرور الجديدة يجب ان تكون على الاقل 6 حروف'
            })
        }

        if (!formData.confirmPassword) {
            newErrors.push({
                field: 'confirmPassword',
                message: 'تاكيد كلمة المرور مطلوب'
            })
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.push({
                field: 'confirmPassword',
                message: 'كلمة المرور غير متطابقة'
            })
        }

        return newErrors;
    }

    const getError = (field: string) => errors.find(e => e.field === field)?.message;

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        setErrors(prev => prev.filter(e => e.field !== field));
    };

    const handleSubmit = async () => {
        const validationErrors = validate();

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);

        await changePassword.mutateAsync(formData.newPassword);
    }

    useEffect(() => {
        if (changePassword.isSuccess) {
            setOpen(false);
            setFormData({
                newPassword: '',
                confirmPassword: ''
            });
        }

        if (changePassword.isError) {
            setErrors([{ field: 'server', message: changePassword.error?.message || 'حدث خطأ ما' }]);
            toast.error('فشل في تغيير كلمة المرور');
        }
    }, [changePassword.isSuccess, changePassword.isError, changePassword.mutateAsync]);

    return (
        <>
            <Label>كلمة المرور</Label>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full"
                    >
                        تغيير كلمة المرور
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='text-xl'>تغيير كلمة المرور</DialogTitle>
                        <DialogDescription>
                            سيتم تغيير كلمة المرور الخاصة بك
                        </DialogDescription>
                    </DialogHeader>
                    <div className='flex flex-col gap-2'>
                        <div>
                            <Label>كلمة المرور الجديدة</Label>
                            <Input
                                type='password'
                                value={formData.newPassword}
                                onChange={(e) => handleChange('newPassword', e.target.value)}
                            />
                            {getError('newPassword') && (
                                <p className="text-red-500 text-sm mt-1">
                                    {getError('newPassword')}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>أعد كلمة المرور الجديدة</Label>
                            <Input
                                type='password'
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            />
                            {getError('confirmPassword') && (
                                <p className="text-red-500 text-sm mt-1">
                                    {getError('confirmPassword')}
                                </p>
                            )}
                        </div>

                        {getError('server') && (
                            <p className="text-red-500 text-sm mt-1">
                                {getError('server')}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleSubmit}
                            className='flex-1'
                            disabled={changePassword.isPending}
                        >
                            تغيير كلمة المرور
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ChangePasswordComponent