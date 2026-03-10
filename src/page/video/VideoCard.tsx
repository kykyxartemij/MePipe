'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { VideoLightModel } from '@/models/video.models';

/* Layout & utility classes are done by Tailwind; keep a tiny inline aspect ratio fallback */

export function VideoCardSkeleton() {
  return (
    <>
      <div className="w-full">
        <div className="shimmer w-full" style={{ aspectRatio: '16/9' }} />
        <div className="p-2 pt-1">
          <div className="shimmer h-3.5 w-3/4 mb-2" />
          <div className="shimmer h-2.5 w-full mb-1.5" />
          <div className="shimmer h-2.5 w-7/12" />
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
  video: VideoLightModel;
  maxDescriptionLength?: number;
}) {
  const [hovered, setHovered] = useState(false);

  const desc = video.description
    ? video.description.length > maxDescriptionLength
      ? video.description.slice(0, maxDescriptionLength) + '…'
      : video.description
    : null;

  const hoverClasses = hovered ? 'shadow-[0_0_0_8px_#1a1a1a] bg-[#1a1a1a]' : '';

  return (
    <Link
      href={`/video/${video.id}`}
      className={`block w-full rounded-lg transition-shadow transition-colors ${hoverClasses}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {video.thumbnailUrl ? (
        <img src={video.thumbnailUrl} alt={video.title} className="w-full block object-cover rounded-lg" style={{ aspectRatio: '16/9' }} />
      ) : (
        <div className="w-full rounded-lg" style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
          <span className="text-[var(--text-muted)]">No thumbnail</span>
        </div>
      )}
      <div className="p-2 pt-1">
        <h3 className="text-sm font-semibold mb-0.5">{video.title}</h3>
        {desc && <p className="text-sm text-[var(--text-muted)] m-0">{desc}</p>}
      </div>
    </Link>
  );
}
