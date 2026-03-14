import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface Props {
    image: {
        id: string;
        image_url: string;
        image_name: string;
    }
    removeImage: (imageId: string, imageUrl?: string) => void
    className?: string
    imageUrl?: string
}

const ServiceImageComponent = ({ image, removeImage, className, imageUrl }: Props) => {
    return (
        <div className="relative group">
            <div className={cn("aspect-square rounded-lg overflow-hidden border border-border", className)}>
                <img
                    src={image.image_url}
                    alt={image.image_name}
                    className="w-full h-full object-cover"
                />
            </div>
            <button
                type="button"
                onClick={() => imageUrl ? removeImage(image.id, imageUrl) : removeImage(image.id)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
                <X size={16} />
            </button>
            <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-1 rounded truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {image.image_name}
            </div>
        </div>
    )
}

export default ServiceImageComponent