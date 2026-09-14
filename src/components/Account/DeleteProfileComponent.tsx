import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useEffect, useState } from "react";
import { Shredder } from 'lucide-react';

interface Props {
    deleteProfile: () => void;
    isDeleting: boolean;
}

const DeleteProfileComponent = ({
    deleteProfile,
    isDeleting
}: Props) => {
    const { t } = useTranslation("account");
    const [open, setOpen] = useState<boolean>(false);

    const handleDeleteProfile = () => {
        setOpen(false);
        deleteProfile();
    }


    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        if (isDeleting) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isDeleting]);

    return (
        <div>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="ghost"
                        disabled={isDeleting}
                        className="w-fit text-start text-red-500 hover:text-red-400 active:text-red-600 hover:bg-transparent"
                    >
                        {t("delete_profile")}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="z-10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("delete_profile_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("delete_profile_description")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isDeleting}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProfile}
                            disabled={isDeleting}
                        >
                            {t("delete")}
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {isDeleting && (
                <div className="fixed inset-0 z-[9999] bg-background/50 backdrop-blur-lg flex items-center justify-center">
                    <Shredder className="text-primary size-40" />
                </div>
            )}
        </div>
    )
}

export default DeleteProfileComponent