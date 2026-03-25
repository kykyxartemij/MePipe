import VideoPage from '@/page/video/VideoPage';
import ArtSkeleton from '@/components/ui/ArtSkeleton';
import { VideoCardSkeleton } from '@/page/video/VideoCard';

export default function Loading() {
  return (
    <div className="max-w-450 mx-auto flex gap-6 max-lg:flex-col">
      <div className="flex-1 min-w-0">
        <VideoPage loading />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <ArtSkeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <aside className="w-100 min-w-85 max-lg:w-full max-lg:min-w-0">
        <div className="flex flex-col gap-3.5">
          {Array.from({ length: 8 }, (_, i) => (
            <VideoCardSkeleton key={i} horizontal />
          ))}
        </div>
      </aside>
    </div>
  );
}
