import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { videoId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { videoId: id, text },
  });
  return NextResponse.json(comment, { status: 201 });
}


