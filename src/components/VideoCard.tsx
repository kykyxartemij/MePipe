import Link from "next/link";

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  description?: string;
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/video/${video.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
          background: "var(--surface)",
          cursor: "pointer",
          transition: "border-color 0.2s",
        }}
      >
        <video
          src={video.videoUrl}
          muted
          style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }}
        />
        <div style={{ padding: 12 }}>
          <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>{video.title}</h3>
          {video.description && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {video.description.slice(0, 100)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
