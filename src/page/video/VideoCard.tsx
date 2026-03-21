'use client';

import Link from 'next/link';
import ArtSkeleton from '@/components/ui/ArtSkeleton';
import Image from 'next/image';
import type { VideoLightModel } from '@/models/video.models';

export function VideoCardSkeleton({ horizontal = false }: { horizontal?: boolean }) {
  if (horizontal) {
    return (
      <div className="flex gap-2 p-1 w-full">
        <ArtSkeleton className="w-42 min-w-42 aspect-video rounded-lg shrink-0" />
        <div className="flex-1 min-w-0 pt-1">
          <ArtSkeleton className="h-3.5 w-11/12 mb-2" />
          <ArtSkeleton className="h-2.5 w-7/12" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ArtSkeleton className="w-full aspect-video" />
      <div className="p-2 pt-1">
        <ArtSkeleton className="h-3.5 w-3/4 mb-2" />
        <ArtSkeleton className="h-2.5 w-full mb-1.5" />
        <ArtSkeleton className="h-2.5 w-7/12" />
      </div>
    </div>
  );
}

export default function VideoCard({
  video,
  maxDescriptionLength = 100,
  horizontal = false,
}: {
  video: VideoLightModel;
  maxDescriptionLength?: number;
  horizontal?: boolean;
}) {
  const desc = video.description
    ? video.description.length > maxDescriptionLength
      ? video.description.slice(0, maxDescriptionLength) + '…'
      : video.description
    : null;

  if (horizontal) {
    return (
      <Link
        href={`/video/${video.id}`}
        prefetch
        className="flex gap-2 p-1 w-full rounded-lg transition-colors hover:no-underline hover:shadow-[0_0_0_8px_var(--surface)] hover:bg-muted"
      >
        <div className="w-42 min-w-42 shrink-0">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full rounded-lg aspect-video"
            width={1280}
            height={720}
          />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-sm font-semibold mb-0.5 line-clamp-2">{video.title}</h3>
          {desc && <p className="text-xs text-muted mt-0.5 line-clamp-2">{desc}</p>}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/video/${video.id}`}
      prefetch
      className="block w-full rounded-lg transition-all hover:no-underline hover:shadow-[0_0_0_8px_var(--surface)] hover:bg-muted"
    >
      <Image
        src={video.thumbnailUrl}
        alt={video.title}
        className="w-full rounded-lg aspect-video"
        width={1280}
        height={720}

      />
      <div className="p-2 pt-1">
        <h3 className="text-sm font-semibold mb-0.5">{video.title}</h3>
        {desc && <p className="text-sm text-muted m-0">{desc}</p>}
      </div>
    </Link>
  );
}
