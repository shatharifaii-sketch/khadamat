import React, { useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import ServiceImageComponent from './ServiceImageComponent';
import { useTranslation } from 'react-i18next';
import { VideoPlayer } from '@/components/VideoPlayer';

type MediaItem = {
    id: string;
    url: string;
    name: string;
    thumbnail?: string;
    thumbnail_url?: string;
    type?: 'image' | 'video';
}

interface ServicePortfolioProps {
    serviceMedia?: Array<MediaItem> | [];
    onMediaChange?: (media: MediaItem[]) => void;
}

const ServiceImages = ({ onMediaChange, serviceMedia }: ServicePortfolioProps) => {
    const { t } = useTranslation("services");
    const { media, uploading, handleFileSelect, removeImage, deleteImage, deletingImage } = useImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    let allImagesCount = media.length + (serviceMedia ? serviceMedia.length : 0);

    useEffect(() => {
        onMediaChange?.(media)

        if (serviceMedia) {
            allImagesCount += media.length;
        }
    }, [media]);

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

    console.log("media: ", media);
    console.log("serviceMedia: ", serviceMedia);

    return (
        <div className="space-y-4 flex flex-col mt-5">

            {serviceMedia && serviceMedia.length > 0 && (
                <div className='space-y-2'>
                    <Label className="text-large font-semibold">
                        {t("post_service.existing_files")}
                    </Label>

                    <div className="grid grid-cols-3 gap-4">
                        {serviceMedia.map((image: MediaItem) =>
                            image.type === "image" ? (
                                <ServiceImageComponent
                                    key={image.id}
                                    className='size-40'
                                    image={image}
                                    removeImage={deleteImage}
                                    imageUrl={image.url}
                                    deletingImage={deletingImage}
                                />
                            ) : (
                                <VideoPlayer
                                    key={image.id}
                                    id={image.id}
                                    url={image.url}
                                    thumbnail={image.thumbnail || image.thumbnail_url}
                                    removeVideo={deleteImage}
                                />
                            )
                        )}
                    </div>

                </div>
            )}
            <div className='space-y-2'>
                <Label className="text-large font-semibold">
                    {t("post_service.add_files")}
                </Label>

                {/* Upload Area */}
                <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-large text-muted-foreground mb-2">
                        {uploading ? t("post_service.uploading_files") : t("post_service.drag_files")}
                    </p>
                    <p className="text-muted-foreground">{t("post_service.file_upload_description")}</p>
                    <Button variant="outline" className="mt-4" type="button" disabled={uploading}>
                        {uploading ? t("post_service.uploading...") : t("post_service.choose_files")}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,video/mp4,video/webm"
                        multiple
                        className="hidden"
                        onChange={handleFileInputChange}
                    />
                </div>

                {/* Uploaded Images Grid */}
                {media.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {media.map((item) =>
                            item.type === "image" ? (
                                <ServiceImageComponent
                                    key={item.id}
                                    image={item}
                                    removeImage={removeImage}
                                />
                            ) : (
                                <VideoPlayer
                                    id={item.id}
                                    url={item.url}
                                    removeVideo={removeImage}
                                    thumbnail={item.thumbnail}
                                />
                            )
                        )}
                    </div>
                )}

                {allImagesCount > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                        {t("post_service.files_uploaded", { count: allImagesCount })}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ServiceImages;
