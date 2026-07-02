import { Loader, X } from "lucide-react";
import HeroVideoDialog from "./ui/HeroVideoDialog";

interface Props {
  id: string;
  url: string;
  removeVideo?: (id: string, url?: string, type?: string, thumbnail?: string) => void
  deletingVideo?: boolean;
  thumbnail?: string
}

export function VideoPlayer({
  id,
  url,
  removeVideo,
  deletingVideo,
  thumbnail
}: Props) {
  return (
    <div className="relative group w-full h-full">
      {deletingVideo && (
        <div className='absolute inset-0 flex items-center justify-center z-50 backdrop-blur-sm rounded-lg'>
          <Loader className='animate-spin text-white' />
        </div>
      )}
      <div className="aspect-auto rounded-lg overflow-hidden border border-border z-10">
        <HeroVideoDialog
          className="block dark:hidden "
          animationStyle="top-in-bottom-out"
          videoSrc={url}
          thumbnailSrc={thumbnail}
          thumbnailAlt="Hero Video"
        />
        <HeroVideoDialog
          className="hidden dark:block"
          animationStyle="top-in-bottom-out"
          videoSrc={url}
          thumbnailSrc={thumbnail}
          thumbnailAlt="Hero Video"
        />
      </div>

      {removeVideo && (
        <button
        type="button"
        onClick={() => removeVideo?.(id, url, "video", thumbnail)}
        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
      >
        <X size={16} />
      </button>
      )}
    </div>
  )
}