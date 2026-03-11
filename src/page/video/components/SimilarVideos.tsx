 'use client';

import { useSimilarVideos } from '@/hooks/video.hooks';
import Link from 'next/link';
import type { VideoLightModel } from '@/models/video.models';
import VideoCard, { VideoCardSkeleton } from '../VideoCard';

export default function SimilarVideos({ videoId }: { videoId: string }) {
  const { data, isLoading } = useSimilarVideos(videoId, 1, 75);

  const videos = data?.data ?? [];

  return (
    <div>
      {isLoading
        ? Array.from({ length: 8 }, (_, i) => <VideoCardSkeleton key={i} />)
        : videos.map((v: VideoLightModel) => <VideoCard key={v.id} video={v} />)}
      {!isLoading && videos.length === 0 && <p className="text-[var(--text-muted)] text-sm">No similar videos found.</p>}
    </div>
  );
}
