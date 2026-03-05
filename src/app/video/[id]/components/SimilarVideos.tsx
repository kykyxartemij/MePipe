"use client";

import { useSimilarVideos } from "../../hooks/useVideoHooks";
import Link from "next/link";
import type { CSSProperties } from "react";

import type { VideoLight } from "@/models/video.models";
interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string | null;
  description?: string;
}

const cardStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  textDecoration: "none",
  color: "inherit",
  borderRadius: 8,
  padding: 4,
};

const thumbStyle: CSSProperties = {
  width: 168,
  minWidth: 168,
  aspectRatio: "16/9",
  objectFit: "cover",
  borderRadius: 8,
  background: "#1a1a1a",
};

const titleStyle: CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  margin: 0,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const descStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#888",
  margin: "4px 0 0",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/* skeleton shimmer */
const shimmer: CSSProperties = {
  background: "linear-gradient(90deg, #1a1a1a 25%, #333 50%, #1a1a1a 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s ease-in-out infinite",
  borderRadius: 6,
};

function SkeletonCard() {
  return (
    <div style={{ display: "flex", gap: 8, padding: 4 }}>
      <div style={{ ...shimmer, width: 168, minWidth: 168, aspectRatio: "16/9", borderRadius: 8 }} />
      <div style={{ flex: 1 }}>
        <div style={{ ...shimmer, height: 14, width: "90%", marginBottom: 8 }} />
        <div style={{ ...shimmer, height: 11, width: "70%" }} />
      </div>
    </div>
  );
}

export default function SimilarVideos({ videoId }: { videoId: string }) {
  const { data, isLoading } = useSimilarVideos(videoId);

  const videos = data ?? [];

  return (
    <div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {isLoading
        ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
        : videos.map((v) => (
            <Link key={v.id} href={`/video/${v.id}`} style={cardStyle}>
              {v.thumbnail ? 
              (
                <img src={v.thumbnail} alt={v.title} style={thumbStyle} />
              ) : (
                <video src={v.videoUrl} muted style={thumbStyle} />
              )}
              <div style={{ flex: 1 }}>
                <p style={titleStyle}>{v.title}</p>
                {v.description && <p style={descStyle}>{v.description}</p>}
              </div>
            </Link>
          ))}
      {!isLoading && videos.length === 0 && (
        <p style={{ color: "#666", fontSize: 14 }}>No similar videos found.</p>
      )}
    </div>
  );
}