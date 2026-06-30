import HeroVideoDialog from "./ui/HeroVideoDialog";

interface Props {
    id: string;
    url: string;
    removeVideo: (id: string, url?: string) => void
    deleteVideo: (id: string, url?: string) => void
}

export function VideoPlayer({
    id,
    url,
    removeVideo,
    deleteVideo
}: Props) {
  return (
    <div className="relative">
      <HeroVideoDialog
        className="block dark:hidden"
        animationStyle="top-in-bottom-out"
        videoSrc={url}
        thumbnailSrc=""
        thumbnailAlt="Hero Video"
      />
      <HeroVideoDialog
        className="hidden dark:block"
        animationStyle="top-in-bottom-out"
        videoSrc={url}
        thumbnailSrc=""
        thumbnailAlt="Hero Video"
      />
    </div>
  )
}