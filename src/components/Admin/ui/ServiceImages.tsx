import React, { useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import ServiceImageComponent from './ServiceImageComponent';

//TODO: refresh images when deleted

interface ServicePortfolioProps {
    serviceImages?: Array<{ id: string; image_url: string; image_name: string }> | [];
    onImagesChange?: (images: Array<{ id: string; image_url: string; image_name: string }>) => void;
}

const ServiceImages = ({ onImagesChange, serviceImages }: ServicePortfolioProps) => {
    const { images, uploading, handleFileSelect, removeImage, deleteImage } = useImageUpload();
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

    console.log(serviceImages);

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
                        صور محملة مسبقا
                    </Label>

                    <div className="grid grid-cols-3 gap-4">
                        {serviceImages.map((image) => (
                            <ServiceImageComponent
                                key={image.id}
                                className='size-40'
                                image={image}
                                removeImage={deleteImage}
                                imageUrl={image.image_url}
                            />
                        ))}
                    </div>

                </div>
            )}
            <div className='space-y-2'>
                <Label className="text-large font-semibold">
                    صور الخدمة
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
                        {uploading ? 'جاري رفع الصور...' : 'اسحب الصور هنا أو اضغط للرفع'}
                    </p>
                    <p className="text-muted-foreground">PNG, JPG حتى 10MB • 6 صور كحد أقصى</p>
                    <Button variant="outline" className="mt-4" type="button" disabled={uploading}>
                        {uploading ? 'جاري الرفع...' : 'اختر الصور'}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        تم رفع {allImagesCount} من أصل 6 صور
                    </p>
                )}
            </div>
        </div>
    );
};

export default ServiceImages;
