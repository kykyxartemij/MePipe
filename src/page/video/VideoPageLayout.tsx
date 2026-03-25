'use client';

import { useState, useCallback } from 'react';
import VideoPage from './VideoPage';
import CommentSection from './components/CommentSection';
import SimilarVideos from './components/SimilarVideos';

export default function VideoPageLayout({ videoId }: { videoId: string }) {
  const [theaterMode, setTheaterMode] = useState(false);

  const enterTheater = useCallback(() => setTheaterMode(true), []);
  const exitTheater  = useCallback(() => setTheaterMode(false), []);

  if (theaterMode) {
    return (
      <>
        {/* Player: full-bleed — counteract main's px-6 py-4 */}
        <div className="-mx-6 -mt-4 animate-[art-fade-in_200ms_ease-out]">
          <VideoPage videoId={videoId} theaterMode playerOnly onToggleTheater={exitTheater} />
        </div>

        {/* Info + comments on left, similar on right */}
        <div className="max-w-450 mx-auto flex gap-6 max-lg:flex-col animate-[art-fade-in_200ms_ease-out]">
          <div className="flex-1 min-w-0">
            <VideoPage videoId={videoId} infoOnly />
            <CommentSection videoId={videoId} />
          </div>
          <aside className="w-100 min-w-85 max-lg:w-full max-lg:min-w-0 pt-3">
            <SimilarVideos videoId={videoId} />
          </aside>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-450 mx-auto flex gap-6 max-lg:flex-col animate-[art-fade-in_200ms_ease-out]">
      {/* Player and info are SEPARATE component instances.
          VideoPlayer state changes (playing, speed, volume) only re-render the playerOnly
          instance — the infoOnly instance is independent and stays stable. */}
      <div className="flex-1 min-w-0">
        <VideoPage videoId={videoId} playerOnly onToggleTheater={enterTheater} />
        <VideoPage videoId={videoId} infoOnly />
        <CommentSection videoId={videoId} />
      </div>
      <aside className="w-100 min-w-85 max-lg:w-full max-lg:min-w-0 pt-4">
        <SimilarVideos videoId={videoId} />
      </aside>
    </div>
  );
}
