'use client';

import { useState } from 'react';
import { useById } from '@/hooks/video.hooks';
import ArtSkeleton from '@/components/ui/ArtSkeleton';
import ArtBadge from '@/components/ui/ArtBadge';
import VideoPlayer from './components/VideoPlayer';

interface VideoPageProps {
  videoId?: string;
  loading?: boolean;
}

export default function VideoPage({ videoId = '', loading = false }: VideoPageProps) {
  const { data: video, isLoading, isError } = useById(videoId, { enabled: !loading });
  const [theaterMode, setTheaterMode] = useState(false);

  const toggleTheater = () => setTheaterMode(t => !t);

  if (loading || isLoading) return <Skeleton />;
  if (isError || !video) return <p className="text-muted mt-8">Video not found.</p>;

  const playerEl = (
    <VideoPlayer src={video.videoUrl} theaterMode={theaterMode} onToggleTheater={toggleTheater} />
  );

  return (
    <>
      {theaterMode ? (
        <div style={{ marginTop: '-0.75rem', width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>
          {playerEl}
        </div>
      ) : (
        playerEl
      )}

      <div className="mt-3">
        <h2 className="mb-1 text-xl font-semibold">{video.title}</h2>

        {video.genres.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {video.genres.map((g) => (
              <ArtBadge key={g.id} variant="ghost">{g.name}</ArtBadge>
            ))}
          </div>
        )}

        <p className="text-sm text-muted">{video.description}</p>
      </div>
    </>
  );
}

// Skeleton mirrors only the player + title area (layout is owned by page.tsx)
function Skeleton() {
  return (
    <>
      <ArtSkeleton className="w-full rounded-xl aspect-video" />
      <ArtSkeleton className="h-6 w-3/5 mt-3" />
      <div className="flex gap-1.5 mt-2">
        {Array.from({ length: 3 }, (_, i) => (
          <ArtSkeleton key={i} className="h-5 w-16 rounded-full" />
        ))}
      </div>
      <ArtSkeleton className="h-3.5 w-4/5 mt-3" />
      <ArtSkeleton className="h-3.5 w-2/5 mt-2" />
    </>
  );
}
