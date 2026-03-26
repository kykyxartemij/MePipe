import { VideoCardSkeleton } from '@/page/video/VideoCard';

export default function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 20 }, (_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
