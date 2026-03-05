import { NextRequest } from "next/server";
import { getRelatedVideos } from "@/services/video.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return getRelatedVideos(request, params);
}
