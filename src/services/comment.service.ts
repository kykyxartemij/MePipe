// NOTE: This file currently also used as example of API route structure and error handling.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CommentCreateValidator } from '@/models/comment.models';
import { parseIdFromRoute } from '@/models';
import { parsePaginationFromUrl, createPaginatedResponse } from '@/models/paginated-response.model';
import { handleApiError } from '@/lib/errorHandler';
import { cached, invalidateCache } from '@/lib/serverCache';
import { CACHE_KEYS } from '@/lib/cacheKeys';

// ==== GET ====
export async function getPagedCommentsByVideoId(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const id = parseIdFromRoute(await params);

    const { searchParams } = request.nextUrl;
    const { page, pageSize } = await parsePaginationFromUrl(searchParams);

    // Fetch paginated comments directly from the database using videoId
    const [comments, totalCount] = await Promise.all([
      cached(
        () =>
          prisma.comment.findMany({
            where: { videoId: id },
            orderBy: { createdAt: 'desc' },
            skip: page * pageSize,
            take: pageSize,
          }),
        CACHE_KEYS.comment.paged(id, page, pageSize)
      ),
      cached(
        () => prisma.comment.count({ where: { videoId: id } }),
        CACHE_KEYS.comment.count(id)
      ),
    ]);

    // Return paginated response
    return NextResponse.json(createPaginatedResponse(comments, page, pageSize, totalCount));
  } catch (error) {
    return handleApiError(error, 'GET comments');
  }
}

// NOTE: Not in use
export async function getCommentById(request: NextRequest, params: Promise<{ id: string }>) {
  try {
    const id = parseIdFromRoute(await params);
    const comment = await cached(
      () => prisma.comment.findUniqueOrThrow({ where: { id } }),
      CACHE_KEYS.comment.byId(id)
    );
    return NextResponse.json(comment);
  } catch (error) {
    return handleApiError(error, 'GET comment by ID');
  }
}

// ==== POST ====
export async function createComment(request: NextRequest, params: Promise<{ id: string }>) {
  try {
    const id = parseIdFromRoute(await params);

    const { text } = await CommentCreateValidator.validate(await request.json());

    const comment = await prisma.comment.create({
      data: { text, videoId: id },
    });

    invalidateCache(...CACHE_KEYS.comment.invalidate());
    await cached(() => Promise.resolve(comment), CACHE_KEYS.comment.byId(comment.id));

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST comment');
  }
}
