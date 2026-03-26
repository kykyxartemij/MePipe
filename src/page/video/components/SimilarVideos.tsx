'use client';

import { useSimilarVideos } from '@/hooks/video.hooks';
import type { VideoLightModel } from '@/models/video.models';
import VideoCard, { VideoCardSkeleton } from '../VideoCard';

export default function SimilarVideos({ videoId }: { videoId: string }) {
  const { data, isLoading } = useSimilarVideos(videoId, 1, 75);
  const videos = data?.data ?? [];

  return (
    <div className="flex flex-col gap-3.5">
      {isLoading
        ? Array.from({ length: 8 }, (_, i) => <VideoCardSkeleton key={i} horizontal />)
        : videos.map((v: VideoLightModel) => <VideoCard key={v.id} video={v} horizontal />)}
      {!isLoading && videos.length === 0 && (
        <p className="text-muted text-sm">No similar videos found.</p>
      )}
    </div>
  );
}
