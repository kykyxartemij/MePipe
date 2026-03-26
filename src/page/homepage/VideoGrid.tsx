'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePagedVideos } from '@/hooks/video.hooks';
import type { VideoLightModel } from '@/models/video.models';
import type { PaginatedResponse } from '@/models/paginated-response.model';
import VideoCard, { VideoCardSkeleton } from '../video/VideoCard';

const SKELETON_COUNT = 20;

export default function VideoGrid({ search = '' }: { search?: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePagedVideos(1, 100, search);

  const videos = data?.pages.flatMap((p: PaginatedResponse<VideoLightModel>) => p.data) ?? [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <>
      {isError && <p className="text-red-500 mt-4">Failed to load videos.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => <VideoCardSkeleton key={i} />)
          : videos.map((video: VideoLightModel) => <VideoCard key={video.id} video={video} />)}

        {isFetchingNextPage &&
          Array.from({ length: 4 }, (_, i) => <VideoCardSkeleton key={`next-${i}`} />)}
      </div>

      {!isLoading && videos.length === 0 && (
        <p className="text-muted mt-8">No videos found.</p>
      )}

      {/* Invisible sentinel that triggers the next page load */}
      <div ref={sentinelRef} className="h-px" />
    </>
  );
}
