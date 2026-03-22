import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { Input } from '../ui/input'

interface ChangeEmailComponentProps {
    user: User
}

const ChangeEmailComponent = ({
    user
}: ChangeEmailComponentProps) => {
    const [changeEmail, setChangeEmail] = useState(true);
    const [open, setOpen] = useState(false);
    return (
        <>
            <Label>البريد الإلكتروني</Label>
            <Input
                readOnly={changeEmail}
                value={user.email}
            />
            <Button>
                تغيير البريد الإلكتروني
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>

                </DialogContent>
            </Dialog>
        </>
    )
}

export default ChangeEmailComponent