import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeText } from '@/lib/freeText';
import { parseIdFromRoute } from '@/models';
import { parsePaginationFromUrl, createPaginatedResponse } from '@/models/paginated-response.model';
import { handleApiError } from '@/lib/errorHandler';
import { writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { AgeRating, VideoCreateValidator, VideoWriteModel } from '@/models/video.models';
import { cached, invalidateCache } from '@/lib/serverCache';
import { CACHE_KEYS } from '@/lib/cacheKeys';

// ==== GET ALL (PAGED) ====
export async function getPagedVideos(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { page, pageSize } = await parsePaginationFromUrl(searchParams);
    const freeText = normalizeText(searchParams.get('freeText') ?? '');

    const where = freeText
      ? {
          OR: [
            { title: { contains: freeText, mode: 'insensitive' as const } },
            { genres: { some: { name: { contains: freeText, mode: 'insensitive' as const } } } },
          ],
        }
      : {};

    const videos = await cached(
      () =>
        prisma.video.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { publishedAt: 'desc' },
          include: { genres: true },
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            description: true,
          },
        }),
      CACHE_KEYS.video.paged(page, pageSize, freeText)
    );

    return NextResponse.json(createPaginatedResponse(videos, page, pageSize));
  } catch (error) {
    return handleApiError(error, 'GET videos');
  }
}

// ==== GET BY ID ====
export async function getVideoById(params: Promise<{ id: string }>) {
  try {
    const id = parseIdFromRoute(await params);
    const video = await cached(
      () =>
        prisma.video.findUniqueOrThrow({
          where: { id },
          include: {
            genres: true,
            _count: {
              select: { comments: true },
            },
          },
        }),
      CACHE_KEYS.video.byId(id)
    );

    return NextResponse.json(video);
  } catch (error) {
    return handleApiError(error, 'GET video by ID');
  }
}

// ==== GET SIMILAR ====
export async function getSimilarVideos(request: NextRequest, params: Promise<{ id: string }>) {
  try {
    const id = parseIdFromRoute(await params);

    const { searchParams } = request.nextUrl;
    const { page, pageSize } = await parsePaginationFromUrl(searchParams);

    // NOTE: Cool example of prisma's Relation usage
    // prettier-ignore
    const related = await cached(
      () =>
        prisma.video.findMany({
          where: {
            id: { not: id }, // videoId
            genres: { // videoId -> genreId
              some: {
                videos: { // videoId -> genreId -> genreVideoId
                  some: {
                    id: id, // videoId -> genreId: videoId -> genreId -> genreVideoId -> genreGenreId
                  },
                },
              },
            },
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            videoUrl: true,
            thumbnailUrl: true,
            description: true,
          },
        }),
      CACHE_KEYS.video.similar(id, page, pageSize)
    );

    return NextResponse.json(createPaginatedResponse(related, page, pageSize));
  } catch (error) {
    return handleApiError(error, 'GET related videos');
  }
}

// ==== GET SEARCH SUGGESTIONS ====
export async function getSearchSuggestions(request: NextRequest) {
  try {
    const freeText = normalizeText(request.nextUrl.searchParams.get('freeText') ?? '');
    if (freeText.length < 1) return NextResponse.json([]);

    const videos = await cached(
      () =>
        prisma.video.findMany({
          where: {
            OR: [
              { title: { contains: freeText, mode: 'insensitive' } },
              { genres: { some: { name: { contains: freeText, mode: 'insensitive' } } } },
            ],
          },
          select: { title: true },
          orderBy: { publishedAt: 'desc' },
          take: 8,
          distinct: ['title'],
        }),
      CACHE_KEYS.video.search(freeText)
    );

    return NextResponse.json(videos);
  } catch (error) {
    return handleApiError(error, 'GET search suggestions');
  }
}

// ==== CREATE ====
export async function createVideo(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) ?? '';
    const genreIds = formData.getAll('genreIds') as string[];
    const ageRatingRaw = formData.get('ageRating') as AgeRating;

    const thumbnail = formData.get('thumbnailFile') as File | null;
    const video = formData.get('videoFile') as File;

    const validationData: VideoWriteModel = {
      title,
      description,
      thumbnailFile: thumbnail || undefined,
      ageRating: ageRatingRaw,
      genreIds,
      videoFile: video,
    };
    const validatedData = await VideoCreateValidator.validate(validationData);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(validatedData.videoFile.name) || '.mp4';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    const bytes = await validatedData.videoFile.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // TODO: Check what AI made ============
    // ALSO: Add videoLength (minutes:seconds) to prisma.scheme/database
    // Thumbnail processing
    let thumbnailPath = path.join(uploadsDir, `${filename}-thumb.jpg`);
    if (validatedData.thumbnailFile) {
      // If thumbnail uploaded, process it
      const thumbBytes = await validatedData.thumbnailFile.arrayBuffer();
      await sharp(Buffer.from(thumbBytes))
        .resize(1280, 720, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    } else {
      // If no thumbnail, extract frame from video
      // Ensure video is at least 3s
      const getVideoDuration = async (filePath: string): Promise<number> => {
        return new Promise((resolve, reject) => {
          ffmpeg.ffprobe(filePath, (err: Error | null, metadata: ffmpeg.FfprobeData) => {
            if (err) return reject(err);
            const duration = metadata.format.duration;
            if (typeof duration === 'number') {
              resolve(duration);
            } else {
              reject(new Error('Duration not found'));
            }
          });
        });
      };
      const duration = await getVideoDuration(filePath);
      if (duration < 3) {
        return NextResponse.json(
          { error: 'Video must be at least 3 seconds long' },
          { status: 400 }
        );
      }
      if (duration > 3600) {
        return NextResponse.json(
          { error: 'Video must not be longer than 60 minutes' },
          { status: 400 }
        );
      }
      // Extract frame at 1s
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .screenshots({
            timestamps: [1],
            filename: `${filename}-thumb-temp.jpg`,
            folder: uploadsDir,
            size: '1280x720',
          })
          .on('end', resolve)
          .on('error', reject);
      });
      // Convert to jpg and crop with sharp
      await sharp(path.join(uploadsDir, `${filename}-thumb-temp.jpg`))
        .resize(1280, 720, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      // Remove temp file
      await fs.promises.unlink(path.join(uploadsDir, `${filename}-thumb-temp.jpg`));
      if (typeof duration !== 'number' || duration < 3) {
        return NextResponse.json(
          { error: 'Video must be at least 3 seconds long' },
          { status: 400 }
        );
      }
    }
    // ==== End of what AI made ===============

    const videoRecord = await prisma.video.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        videoUrl: `/uploads/${filename}`,
        thumbnailUrl: `/uploads/${filename}-thumb.jpg`,
        ageRating: validatedData.ageRating,
        genres: { connect: validatedData.genreIds.map((id) => ({ id })) },
      },
      include: { genres: true },
    });

    invalidateCache(...CACHE_KEYS.video.invalidate());

    return NextResponse.json(videoRecord, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST video');
  }
}
