'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string | null;
  description?: string;
}

/* ─── shared constants ─── */
const BORDER_RADIUS = 12;
const HOVER_SPREAD = 8;

const thumbStyle: CSSProperties = {
  width: '100%',
  display: 'block',
  aspectRatio: '16/9',
  objectFit: 'cover',
  borderRadius: BORDER_RADIUS,
};

const bodyStyle: CSSProperties = {
  padding: '10px 4px 4px',
};

const titleStyle: CSSProperties = {
  fontSize: '0.95rem',
  marginBottom: 2,
  fontWeight: 600,
};

const descStyle: CSSProperties = {
  fontSize: '0.8rem',
  color: '#aaa',
  margin: 0,
};

/* ─── skeleton ─── */
const shimmer: CSSProperties = {
  background: 'linear-gradient(90deg, #1a1a1a 25%, #333 50%, #1a1a1a 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: 6,
};

export function VideoCardSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ width: '100%' }}>
        <div
          style={{
            ...shimmer,
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: BORDER_RADIUS,
          }}
        />
        <div style={bodyStyle}>
          <div style={{ ...shimmer, height: 14, width: '75%', marginBottom: 8 }} />
          <div style={{ ...shimmer, height: 11, width: '100%', marginBottom: 6 }} />
          <div style={{ ...shimmer, height: 11, width: '55%' }} />
        </div>
      </div>
    </>
  );
}

/* ─── card ─── */
export default function VideoCard({
  video,
  maxDescriptionLength = 100,
}: {
  video: Video;
  maxDescriptionLength?: number;
}) {
  const [hovered, setHovered] = useState(false);

  const desc = video.description
    ? video.description.length > maxDescriptionLength
      ? video.description.slice(0, maxDescriptionLength) + '…'
      : video.description
    : null;

  const cardStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: BORDER_RADIUS,
    boxShadow: hovered ? `0 0 0 ${HOVER_SPREAD}px #1a1a1a` : '0 0 0 0px transparent',
    background: hovered ? '#1a1a1a' : 'transparent',
    transition: 'box-shadow 0.2s, background 0.2s',
  };

  return (
    <Link
      href={`/video/${video.id}`}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {video.thumbnail ? (
        <img src={video.thumbnail} alt={video.title} style={thumbStyle} />
      ) : (
        <video src={video.videoUrl} muted style={thumbStyle} />
      )}
      <div style={bodyStyle}>
        <h3 style={titleStyle}>{video.title}</h3>
        {desc && <p style={descStyle}>{desc}</p>}
      </div>
    </Link>
  );
}
