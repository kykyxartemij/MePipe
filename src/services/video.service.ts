import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/freeText";
import { parseIdFromRoute } from "@/models";
import { parsePaginationFromUrl } from "@/models/response";
import { handleApiError } from "@/lib/errorHandler";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ==== GET ALL (PAGED) ====
export const getPagedVideosUrl = (page: number, pageSize: number, freeText?: string) =>
  `/api/videos?page=${page}&pageSize=${pageSize}${freeText ? `&freeText=${freeText}` : ''}`;

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
      ...(genreIds.length > 0 ? [{ genreIds: { hasSome: genreIds } }] : []),
    ],
  };
}

export async function getPagedVideos(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { page, pageSize } = await parsePaginationFromUrl(searchParams);
    const freeText = searchParams.get("freeText") ?? "";

    const where = await buildFreeTextWhere(freeText);

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.video.count({ where }),
    ]);

    return NextResponse.json({ videos, total, page, pageSize });
  } catch (error) {
    return handleApiError(error, 'GET videos');
  }
}

// ==== GET BY ID ====
export const getVideoByIdUrl = (id: string) =>
  `/api/videos/${id}`;

export async function getVideoById(params: Promise<{ id: string }>) {
  try {
    const id = parseIdFromRoute(await params);
    const video = await prisma.video.findUnique({ where: { id } });

    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    return NextResponse.json(video);
  } catch (error) {
    return handleApiError(error, 'GET video by ID');
  }
}

// ==== GET RELATED ====
export const getRelatedVideosUrl = (videoId: string, page: number, pageSize: number) =>
  `/api/videos/${videoId}/related?rpage=${page}&rpagesize=${pageSize}`;

export async function getRelatedVideos(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const id = parseIdFromRoute(await params);
    const video = await prisma.video.findUnique({
      where: { id },
      select: { genreIds: true },
    });

    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("rpage") ?? 1);
    const pageSize = Number(searchParams.get("rpagesize") ?? 10);

    const related = await prisma.video.findMany({
      where: {
        id: { not: id },
        ...(video.genreIds.length > 0
          ? { genreIds: { hasSome: video.genreIds } }
          : {}),
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json(related);
  } catch (error) {
    return handleApiError(error, 'GET related videos');
  }
}

// ==== GET SUGGESTIONS ====
export const getSuggestionsUrl = (freeText: string) =>
  `/api/videos/suggestions?freeText=${freeText}`;

const MAX_SUGGESTIONS = 8;

export async function getSuggestions(request: NextRequest) {
  try {
    const q = normalizeText(request.nextUrl.searchParams.get("freeText") ?? "");
    if (q.length < 1) return NextResponse.json([]);

    const matchingGenres = await prisma.genre.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true },
    });
    const genreIds = matchingGenres.map((g) => g.id);

    const videos = await prisma.video.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          ...(genreIds.length > 0 ? [{ genreIds: { hasSome: genreIds } }] : []),
        ],
      },
      select: { title: true },
      take: MAX_SUGGESTIONS,
      orderBy: { publishedAt: "desc" },
      distinct: ["title"],
    });

    return NextResponse.json(videos.map((v) => v.title));
  } catch (error) {
    return handleApiError(error, 'GET suggestions');
  }
}

// ==== CREATE ====
export const createVideoUrl = () => `/api/videos`;

export async function createVideo(request: NextRequest) {
  try {
    const formData = await request.formData();
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
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST video');
  }
}
