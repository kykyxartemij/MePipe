import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    include: { genres: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
  return NextResponse.json(video);
}


