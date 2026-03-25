'use client';

import { useById } from '@/hooks/video.hooks';
import ArtSkeleton from '@/components/ui/ArtSkeleton';
import ArtBadge from '@/components/ui/ArtBadge';
import ArtTitle from '@/components/ui/ArtTitle';
import VideoPlayer from './components/VideoPlayer';

interface VideoPageProps {
  videoId?: string;
  loading?: boolean;
  theaterMode?: boolean;
  onToggleTheater?: () => void;
  /** Render only the video player (no title/genres/desc) */
  playerOnly?: boolean;
  /** Render only title/genres/desc (no player) */
  infoOnly?: boolean;
}

export default function VideoPage({
  videoId = '',
  loading = false,
  theaterMode = false,
  onToggleTheater,
  playerOnly = false,
  infoOnly = false,
}: VideoPageProps) {
  const { data: video, isLoading, isError } = useById(videoId, { enabled: !loading });

  if (loading || isLoading) return <Skeleton playerOnly={playerOnly} infoOnly={infoOnly} />;
  if (isError || !video) return playerOnly ? null : <p className="text-muted mt-8">Video not found.</p>;

  const playerEl = (
    <VideoPlayer
      src={video.videoUrl}
      theaterMode={theaterMode}
      onToggleTheater={onToggleTheater ?? (() => {})}
    />
  );

  if (playerOnly) return playerEl;

  const info = (
    <>
      <ArtTitle title={video.title} size="lg" />
      {video.genres.length > 0 && (
        <div className="flex gap-1.5 mt-1 mb-2 flex-wrap">
          {video.genres.map((g) => (
            <ArtBadge key={g.id} variant="ghost">{g.name}</ArtBadge>
          ))}
        </div>
      )}
      {video.description && (
        <p className="text-sm text-muted mt-1">{video.description}</p>
      )}
    </>
  );

  if (infoOnly) return info;

  return (
    <>
      {playerEl}
      {info}
    </>
  );
}

// ==== Skeleton ====

function Skeleton({ playerOnly = false, infoOnly = false }: { playerOnly?: boolean; infoOnly?: boolean }) {
  if (infoOnly) {
    return (
      <div className="mt-3">
        <ArtSkeleton className="h-6 w-3/5" />
        <div className="flex gap-1.5 mt-2">
          {Array.from({ length: 3 }, (_, i) => <ArtSkeleton key={i} className="h-5 w-16 rounded-full" />)}
        </div>
        <ArtSkeleton className="h-3.5 w-4/5 mt-3" />
        <ArtSkeleton className="h-3.5 w-2/5 mt-2" />
      </div>
    );
  }

  return (
    <>
      <ArtSkeleton className="w-full rounded-xl aspect-video" />
      {!playerOnly && (
        <>
          <ArtSkeleton className="h-6 w-3/5 mt-3" />
          <div className="flex gap-1.5 mt-2">
            {Array.from({ length: 3 }, (_, i) => <ArtSkeleton key={i} className="h-5 w-16 rounded-full" />)}
          </div>
          <ArtSkeleton className="h-3.5 w-4/5 mt-3" />
          <ArtSkeleton className="h-3.5 w-2/5 mt-2" />
        </>
      )}
    </>
  );
}
