import React, { useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

type MediaItem = {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
}

interface ServicePortfolioProps {
  onMediaChange?: (media: MediaItem[]) => void;
}

const ServicePortfolio = ({ onMediaChange }: ServicePortfolioProps) => {
  const { media, uploading, handleFileSelect, removeImage } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    onMediaChange?.(media);
  }, [media, onMediaChange]);

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
    <div className="space-y-4">
      <Label className="text-large font-semibold">صور من أعمالك السابقة (اختيارية)</Label>

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
          accept="image/png,image/jpeg,image/jpg,video/mp4,video/webm"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Uploaded Images Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border">
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(item.id)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-1 rounded truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {item.name}
              </div>

              {item.type === "video" && (
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  VIDEO
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {media.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          تم رفع {media.length} من أصل 6 ملفات
        </p>
      )}
    </div>
  );
};

export default ServicePortfolio;
