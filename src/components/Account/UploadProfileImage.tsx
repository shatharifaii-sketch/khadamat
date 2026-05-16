import React, { useRef, useState } from "react"
import { Button } from "../ui/button";
import { Loader, Upload, X } from "lucide-react";
import { Label } from "../ui/label";
import { useProfileImageUpload, useSaveProfileImage } from "@/hooks/useProfileImageUpload";
import { Avatar, AvatarImage } from "../ui/avatar";
import { GeneratedAvatar } from "../GeneratedAvatar";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Props {
    userImage?: string | null;
    userName: string;
    userId: string;
}

const UploadProfileImage = ({ userImage, userName, userId }: Props) => {
    const { t } = useTranslation("account");
    const isMobile = useIsMobile();
    const [changeProfileImage, setChangeProfileImage] = useState(false);
    const [userPhoto, setUserPhoto] = useState<string | null>(userImage);
    const { mutate: saveProfileImage, data, isPending, isError, isSuccess } = useSaveProfileImage();


    const { image, uploading, handleFileSelect, removeImage, setImage } = useProfileImageUpload();

    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (image) {
            setUserPhoto(image.url);
        }

        if (!changeProfileImage || !image) {
            setUserPhoto(userImage);
        }

        if (isSuccess) {
            setChangeProfileImage(false);
            setImage(null);
            setUserPhoto(data.profile_image_url);
        }
    }, [image, changeProfileImage, isSuccess]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const { files } = e.dataTransfer;
        if (files.length > 0) {
            handleFileSelect(files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (files && files.length > 0) {
            handleFileSelect(files);
        }
    };

    const handleImageSave = async () => {
        const url = image?.url || null;
        if (url) {
            saveProfileImage({ url, userId });
        }
    }

    return (
        <div className="space-y-4 mb-4">

            <div className={cn("flex items-center gap-5", isMobile && "flex-col")}>
                <div className="relative rounded-lg">
                    {isPending && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm rounded-lg bg-muted-foreground/30">
                            <Loader className="animate-spin text-primary" />
                        </div>
                    )}
                    {userPhoto ? (
                        <Avatar className="size-48 aspect-square">
                            <AvatarImage
                                src={userPhoto}
                                className="size-48 aspect-square"
                            />
                        </Avatar>
                    ) : (
                        <GeneratedAvatar
                            seed={userName}
                            variant="initials"
                            className="size-48 border-2 border-primary"
                        />
                    )}

                    {image && userPhoto === image.url && (
                        <Button
                            className="w-full mt-2"
                            onClick={() => removeImage(image.id)}>
                            {t("remove_image")}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        className="mt-4 w-full"
                        type="button"
                        onClick={() => setChangeProfileImage(!changeProfileImage)}
                    >
                        {t(changeProfileImage ? "cancel" : "change_profile_image")}
                    </Button>
                </div>

                {/* Upload Area */}
                {changeProfileImage && (
                    <div className="flex-1" style={{ minHeight: "300px" }}>
                        <div className="flex flex-col gap-2">
                            <div
                                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
                                <p className="text-large text-muted-foreground mb-2">
                                    {uploading
                                        ? t("uploading_image")
                                        : t("drag_and_drop_or_click")
                                    }
                                </p>
                                <p className="text-muted-foreground">PNG, JPG 10MB</p>
                                <Button variant="outline" className="mt-4" type="button" disabled={uploading}>
                                    {uploading ? t("uploading_image_button")
                                        : t("drag_and_drop_or_click_button")}
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileInputChange}
                                />
                            </div>
                            <Button onClick={handleImageSave}>
                                {t("save_image")}
                            </Button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default UploadProfileImage