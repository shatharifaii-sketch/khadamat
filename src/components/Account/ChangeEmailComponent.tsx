import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { useEmail } from '@/hooks/useEmail'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useProfile } from '@/hooks/useProfile'
import { useTranslation } from 'react-i18next'

interface ChangeEmailComponentProps {
    user: User
}

const ChangeEmailComponent = ({
    user
}: ChangeEmailComponentProps) => {
    const { t } = useTranslation("account");
    const { sendEmailUpdateEmail } = useEmail();
    const { confirmEmail } = useProfile();
    const [changeEmail, setChangeEmail] = useState(false);
    const [email, setEmail] = useState(user?.email || '');
    const [open, setOpen] = useState(false);
    const [confCode, setConfCode] = useState('');
    const [error, setError] = useState('');

    const handleEmailChange = () => {
        if (!email || !user.id) return;
        sendEmailUpdateEmail.mutate({
            oldEmail: user.email,
            newEmail: email,
            name: user.user_metadata.full_name
        });
    }

    const handleConfirmEmail = () => {
        if (!user.email || !email) return;

        confirmEmail.mutate({
            otp: confCode,
            email: email,
            user_id: user.id
        });
    }

    useEffect(() => {
        if (sendEmailUpdateEmail.isSuccess) {
            setOpen(true);
        }

        if (sendEmailUpdateEmail.isError) {
            setChangeEmail(false);
            setError(sendEmailUpdateEmail.error.message);
        }
    }, [sendEmailUpdateEmail.mutate, sendEmailUpdateEmail.isSuccess, sendEmailUpdateEmail.isError]);

    useEffect(() => {
        if (confirmEmail.isSuccess) {
            setChangeEmail(false);
            setOpen(false);
        }

        if (confirmEmail.isError) {
            setError(confirmEmail.error.message);
            setOpen(false);
        }
    }, [confirmEmail.isSuccess, confirmEmail.mutate, confirmEmail.isError]);

    return (
        <>
            <Label>{t("email")}</Label>
            <Input
                readOnly={!changeEmail}
                value={email}
                disabled={!changeEmail}
                onChange={(e) => setEmail(e.target.value)}
            />
            {!user.user_metadata.email_verified && <p className="text-destructive">{t("email_not_verified")}</p>}
            {error && <p className="text-destructive">{error}</p>}
            <div className='flex gap-2'>
                <Button
                    className='min-w-32'
                    onClick={() => {
                        if (changeEmail) {
                            handleEmailChange();
                        } else {
                            setChangeEmail(true);
                        }
                    }}
                    disabled={sendEmailUpdateEmail.isPending}>
                    {changeEmail ? t("confirm") : t("change_email")}
                </Button>
                {changeEmail && <Button variant="outline" onClick={() => setChangeEmail(false)}>{t("cancel")}</Button>}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='text-xl'>{t("confirm_new_email")}</DialogTitle>
                        <DialogDescription>
                            {t("confirm_email_description")}
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder='الرمز'
                            value={confCode}
                            onChange={(e) => setConfCode(e.target.value)}
                        />
                        {confCode.length > 6 && <p className='text-destructive mt-1 text-xs'>
                            {t("confirm_code_too_long")}</p>}
                    </div>
                    <DialogFooter>
                        <Button
                            disabled={(confCode.length > 6) || confirmEmail.isPending}
                            onClick={handleConfirmEmail}
                            className='flex-1'>
                            {t("confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ChangeEmailComponent