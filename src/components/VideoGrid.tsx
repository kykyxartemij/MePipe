"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import VideoCard, { VideoCardSkeleton } from "./VideoCard";

const PAGE_SIZE = 20;
const SKELETON_COUNT = 8;
const COLS_PER_ROW = 4;

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string | null;
  description?: string;
}

interface VideosResponse {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
}

async function fetchVideos(page: number, freeText: string): Promise<VideosResponse> {
  const res = await fetch(
    `/api/videos?page=${page}&pageSize=${PAGE_SIZE}&freeText=${encodeURIComponent(freeText)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
}

export default function VideoGrid({ search = "" }: { search?: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["videos", search],
    queryFn: ({ pageParam }) => fetchVideos(pageParam, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });

  const videos = data?.pages.flatMap((p) => p.videos) ?? [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <>
      {isError && (
        <p style={{ color: "red", marginTop: 16 }}>Failed to load videos.</p>
      )}

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
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <VideoCardSkeleton key={i} />
            ))
          : videos.map((video) => <VideoCard key={video.id} video={video} />)}

        {isFetchingNextPage &&
          Array.from({ length: 4 }, (_, i) => (
            <VideoCardSkeleton key={`next-${i}`} />
          ))}
      </div>

      {!isLoading && videos.length === 0 && (
        <p style={{ color: "var(--text-muted)", marginTop: 32 }}>
          No videos found.
        </p>
      )}

      {/* Invisible sentinel that triggers the next page load */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </>
  );
}

