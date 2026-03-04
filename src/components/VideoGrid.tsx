"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import VideoCard from "./VideoCard";

const PAGE_SIZE = 20;

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  description?: string;
}

interface VideosResponse {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
}

async function fetchVideos(page: number, freeText: string): Promise<VideosResponse> {
  const res = await fetch(`/api/videos?page=${page}&pageSize=${PAGE_SIZE}&freeText=${encodeURIComponent(freeText)}`);
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
}

export default function VideoGrid({ search = "" }: { search?: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["videos", page, search],
    queryFn: () => fetchVideos(page, search),
    placeholderData: (prev) => prev,
  });

  const videos = data?.videos ?? [];
  const total = data?.total ?? 0;

  return (
    <>
      {isLoading && <p style={{ color: "var(--text-muted)", marginTop: 16 }}>Loading...</p>}
      {isError && <p style={{ color: "red", marginTop: 16 }}>Failed to load videos.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {!isLoading && videos.length === 0 && (
        <p style={{ color: "var(--text-muted)", marginTop: 32 }}>No videos found.</p>
      )}

      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button disabled={page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </>
  );
}

