'use client';

import dynamic from 'next/dynamic';
import { useById } from '@/hooks/video.hooks';

const VideoPlayer = dynamic(() => import('./components/VideoPlayer'), {
  loading: () => <div className="shimmer w-full rounded-xl" style={{ aspectRatio: '16/9' }} />,
});
const CommentSection = dynamic(() => import('./components/CommentSection'), {
  loading: () => <div className="mt-6"><div className="shimmer h-8 w-1/4" /></div>,
});
const SimilarVideos = dynamic(() => import('./components/SimilarVideos'), {
  loading: () => (
    <div>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex gap-2 p-1 mb-2">
          <div className="shimmer rounded-lg" style={{ width: 168, minWidth: 168, aspectRatio: '16/9' }} />
          <div className="flex-1">
            <div className="shimmer h-3.5 w-11/12 mb-2" />
            <div className="shimmer h-2.5 w-8/12" />
          </div>
        </div>
      ))}
    </div>
  ),
});

export default function VideoPage({ videoId }: { videoId: string }) {
  const { data: video, isLoading, isError } = useById(videoId);

  if (isLoading) return <VideoPageSkeleton />;
  if (isError || !video) return <p className="text-[var(--text-muted)] mt-8">Video not found.</p>;

  return (
    <div className="video-page">
      <div className="video-main">
        <VideoPlayer src={video.videoUrl} />

        <h2 className="mt-3 mb-1 text-xl font-semibold">{video.title}</h2>

        {video.genres.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {video.genres.map((g) => (
              <span key={g.id} className="genre-badge">{g.name}</span>
            ))}
          </div>
        )}

        <p className="text-sm text-[var(--text-muted)]">{video.description}</p>

        <CommentSection videoId={videoId} />
      </div>

      <aside className="video-sidebar">
        <SimilarVideos videoId={videoId} />
      </aside>
    </div>
  );
}

function VideoPageSkeleton() {
  return (
    <div className="video-page">
      <div className="video-main">
        <div className="shimmer w-full rounded-xl" style={{ aspectRatio: '16/9' }} />
        <div className="shimmer h-6 w-3/5 mt-3" />
        <div className="flex gap-1.5 mt-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="shimmer h-5 w-16 rounded-full" />
          ))}
        </div>
        <div className="shimmer h-3.5 w-4/5 mt-3" />
        <div className="shimmer h-3.5 w-2/5 mt-2" />
      </div>
      <aside className="video-sidebar">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-2 p-1 mb-2">
            <div className="shimmer rounded-lg" style={{ width: 168, minWidth: 168, aspectRatio: '16/9' }} />
            <div className="flex-1">
              <div className="shimmer h-3.5 w-11/12 mb-2" />
              <div className="shimmer h-2.5 w-8/12" />
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
