'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePagedVideos } from '@/hooks/video.hooks';
import VideoCard, { VideoCardSkeleton } from '../video/VideoCard';

const SKELETON_COUNT = 8;
const COLS_PER_ROW = 4;

export default function VideoGrid({ search = '' }: { search?: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePagedVideos(1, 24, search);

  const videos = data?.pages.flatMap((p: any) => p.data) ?? [];

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
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <>
      {isError && <p style={{ color: 'red', marginTop: 16 }}>Failed to load videos.</p>}

      <style>{`
        .video-grid{
          display:grid;
          grid-template-columns:repeat(${COLS_PER_ROW},1fr);
          gap:24px;
        }
        @media(max-width:1024px){.video-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:768px){.video-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:480px){.video-grid{grid-template-columns:1fr}}
      `}</style>
      <div className="video-grid">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => <VideoCardSkeleton key={i} />)
          : videos.map((video: any) => <VideoCard key={video.id} video={video} />)}

        {isFetchingNextPage &&
          Array.from({ length: 4 }, (_, i) => <VideoCardSkeleton key={`next-${i}`} />)}
      </div>

      {!isLoading && videos.length === 0 && (
        <p style={{ color: 'var(--text-muted)', marginTop: 32 }}>No videos found.</p>
      )}

      {/* Invisible sentinel that triggers the next page load */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </>
  );
}
