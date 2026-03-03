"use client";

import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";

const PAGE_SIZE = 20;

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  description?: string;
}

export default function VideoGrid() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/videos?page=${page}&pageSize=${PAGE_SIZE}&title=${title}`)
      .then((r) => r.json())
      .then((data) => {
        setVideos(data.videos);
        setTotal(data.total);
      });
  }, [page, title]);

  return (
    <>
      <input
        type="text"
        placeholder="Search by title..."
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setPage(1);
        }}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      {videos.length === 0 && (
        <p style={{ color: "var(--text-muted)", marginTop: 32 }}>
          No videos found.
        </p>
      )}
      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button
          disabled={page * PAGE_SIZE >= total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
