import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import VideoPageLayout from '@/page/video/VideoPageLayout';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const video = await prisma.video.findUniqueOrThrow({ where: { id }, select: { title: true } });
    return { title: video.title };
  } catch {
    return { title: 'Video' };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VideoPageLayout videoId={id} />;
}
