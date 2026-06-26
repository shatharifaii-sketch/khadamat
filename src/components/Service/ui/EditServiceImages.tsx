import React, { useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import ServiceImageComponent from './ServiceImageComponent';
import { useTranslation } from 'react-i18next';

//TODO: refresh images when deleted

interface ServicePortfolioProps {
    serviceImages?: Array<{ 
        id: string; 
        image_url: string; 
        image_name: string 
    }> | [];
    onImagesChange?: (images: Array<{ id: string; image_url: string; image_name: string }>) => void;
}

const ServiceImages = ({ onImagesChange, serviceImages }: ServicePortfolioProps) => {
    const { t } = useTranslation("services");
    const { images, uploading, handleFileSelect, removeImage, deleteImage, deletingImage } = useImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    let allImagesCount = images.length + (serviceImages ? serviceImages.length : 0);

    useEffect(() => {
        if (onImagesChange) {
            onImagesChange(images);
        }

        if (serviceImages) {
            allImagesCount += images.length;
        }
    }, [images]);

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

    return (
        <div className="space-y-4 flex flex-col mt-5">

            {serviceImages && serviceImages.length > 0 && (
                <div className='space-y-2'>
                    <Label className="text-large font-semibold">
                        {t("post_service.existing_images")}
                    </Label>

                    <div className="grid grid-cols-3 gap-4">
                        {serviceImages.map((image) => (
                            <ServiceImageComponent
                                key={image.id}
                                className='size-40'
                                image={image}
                                removeImage={deleteImage}
                                imageUrl={image.image_url}
                                deletingImage={deletingImage}
                            />
                        ))}
                    </div>

                </div>
            )}
            <div className='space-y-2'>
                <Label className="text-large font-semibold">
                    {t("post_service.add_images")}
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
                        {uploading ? t("post_service.uploading_images") : t("post_service.drag_images")}
                    </p>
                    <p className="text-muted-foreground">{t("post_service.image_upload_description")}</p>
                    <Button variant="outline" className="mt-4" type="button" disabled={uploading}>
                        {uploading ? t("post_service.uploading...") : t("post_service.choose_images")}
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

                {/* Uploaded Images Grid */}
                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {images.map((image) => (
                            <ServiceImageComponent
                                key={image.id}
                                image={image}
                                removeImage={removeImage}
                            />
                        ))}
                    </div>
                )}

                {allImagesCount > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                        {t("post_service.images_uploaded", { count: allImagesCount })}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ServiceImages;
