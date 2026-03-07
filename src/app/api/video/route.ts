import { NextRequest } from 'next/server';
import { getPagedVideos, createVideo } from '@/services/video.service';

export async function GET(request: NextRequest) {
  return getPagedVideos(request);
}

export async function POST(request: NextRequest) {
  return createVideo(request);
}
