import React, { useEffect, useState } from 'react'
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type FormError = {
    message: string,
    field: string
}

const ChangePasswordComponent = () => {
    const { t } = useTranslation("account");
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
                message: t("new_password_required")
            })
        }

        if (formData.newPassword.length < 6) {
            newErrors.push({
                field: 'newPassword',
                message: t("password_min_length")
            })
        }

        if (!formData.confirmPassword) {
            newErrors.push({
                field: 'confirmPassword',
                message: t("confirm_password_required")
            })
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.push({
                field: 'confirmPassword',
                message: t("passwords_do_not_match")
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
            setErrors([{ field: 'server', message: changePassword.error?.message || t('failed_to_change_password') }]);
            toast.error(t('failed_to_change_password'));
        }
    }, [changePassword.isSuccess, changePassword.isError, changePassword.mutateAsync]);

    return (
        <>
            <Label>{t("new_password")}</Label>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full"
                    >
                        {t("change_password")}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='text-xl'>
                            {t("change_password_title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("change_password_description")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='flex flex-col gap-2'>
                        <div>
                            <Label>{t("new_password")}</Label>
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
                            <Label></Label>
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
                            {t("update_password")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ChangePasswordComponent