import { NextRequest } from 'next/server';
import { getSimilarVideos } from '@/services/video.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return getSimilarVideos(request, params);
}
