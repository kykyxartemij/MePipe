import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const title = searchParams.get("title") ?? "";

  const where = title
    ? { title: { contains: title, mode: "insensitive" as const } }
    : {};

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { publishedAt: "desc" },
      include: { genres: true },
    }),
    prisma.video.count({ where }),
  ]);

  return NextResponse.json({ videos, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const title = formData.get("title") as string | null;
  const description = (formData.get("description") as string) ?? "";
  const genresRaw = formData.get("genres") as string | null;
  const file = formData.get("video") as File | null;

  if (!title || !file) {
    return NextResponse.json(
      { error: "Title and video file are required" },
      { status: 400 }
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || ".mp4";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadsDir, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  let genreIds: string[] = [];
  if (genresRaw) {
    try {
      genreIds = JSON.parse(genresRaw);
    } catch {
      /* ignore */
    }
  }

  const video = await prisma.video.create({
    data: { title, description, videoUrl: `/uploads/${filename}`, genreIds },
    include: { genres: true },
  });

  return NextResponse.json(video, { status: 201 });
}


