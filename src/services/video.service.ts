import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/freeText";
import { parseIdFromRoute } from "@/models";
import { parsePaginationFromUrl } from "@/models/paginated-response.model";
import { handleApiError } from "@/lib/errorHandler";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { Genre } from "../../generated/prisma/client";

// ==== GET ALL (PAGED) ====



export async function getPagedVideos(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { page, pageSize } = await parsePaginationFromUrl(searchParams);
    const freeText = normalizeText(searchParams.get("freeText") ?? "");

    const where = freeText
      ? {
          OR: [
            { title: { contains: freeText, mode: "insensitive" as const } },
            { genres: { some: { name: { contains: freeText, mode: "insensitive" as const } } } },
          ],
        }
      : {};

    const videos = await prisma.video.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { publishedAt: "desc" },
      include: { genres: true },
    });
    // const total = await prisma.video.count({ where }); // Disabled: saves a DB operation per request

    return NextResponse.json({ videos, page, pageSize });
  } catch (error) {
    return handleApiError(error, 'GET videos');
  }
}

// ==== GET BY ID ====

export async function getVideoById(params: Promise<{ id: string }>) {
  try {
    const id = parseIdFromRoute(await params);
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        genres: true,
        _count: {
          select: { comments: true }
        }
      },
    });
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    return NextResponse.json(video);
  } catch (error) {
    return handleApiError(error, 'GET video by ID');
  }
}

// ==== GET RELATED ====

export async function getSimilarVideos(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const id = parseIdFromRoute(await params); // NOTE: It's videoId, not commentId

    const { searchParams } = request.nextUrl;
    const { page, pageSize } = await parsePaginationFromUrl(searchParams);
    const videoGenreIds = video.genres.map((g: Pick<Genre, "id">) => g.id);

    const related = await prisma.video.findMany({
      where: {
        id: { not: id },
        ...(videoGenreIds.length > 0
          ? { genres: { some: { id: { in: videoGenreIds } } } }
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

// ==== GET SEARCH SUGGESTIONS ====

const MAX_SUGGESTIONS = 8;

export async function getSearchSuggestions(request: NextRequest) {
  try {
    const q = normalizeText(request.nextUrl.searchParams.get("freeText") ?? "");
    if (q.length < 1) return NextResponse.json([]);

    const videos = await prisma.video.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { genres: { some: { name: { contains: q, mode: "insensitive" } } } },
        ],
      },
      select: { title: true },
      take: MAX_SUGGESTIONS,
      orderBy: { publishedAt: "desc" },
      distinct: ["title"],
    });

    return NextResponse.json(videos.map((v) => v.title));
  } catch (error) {
    return handleApiError(error, 'GET search suggestions');
  }
}

// ==== CREATE ====

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
      data: {
        title,
        description,
        videoUrl: `/uploads/${filename}`,
        genres: { connect: genreIds.map((id) => ({ id })) },
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST video');
  }
}
