import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/freeText";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Build a `where` clause that matches videos by title OR genre name.
 * Returns `{}` when freeText is empty.
 */
async function buildFreeTextWhere(freeText: string) {
  const q = normalizeText(freeText);
  if (!q) return {};

  const matchingGenres = await prisma.genre.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    select: { id: true },
  });
  const genreIds = matchingGenres.map((g) => g.id);

  return {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      ...(genreIds.length > 0
        ? [{ genreIds: { hasSome: genreIds } }]
        : []),
    ],
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const freeText = searchParams.get("freeText") ?? "";

  const where = await buildFreeTextWhere(freeText);

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


