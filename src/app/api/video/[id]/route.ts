import { NextRequest } from "next/server";
import { getVideoById } from "@/services/video.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return getVideoById(params);
}


