// NOTE: This file currently also used as example of API route structure and error handling.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CommentCreateValidator, Comment } from "@/models/comment";
import { parseIdFromRoute } from "@/models";
import { PaginatedResponse, parsePaginationFromUrl } from "@/models/response";
import { handleApiError } from "@/lib/errorHandler";

// ==== GET ====
export const getPagedCommentsByVideoIdUrl = (videoId: string, page: number, pageSize: number) =>
  `/api/videos/${videoId}/comments?page=${page}&pageSize=${pageSize}`;

export async function getPagedCommentsByVideoId(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const id = parseIdFromRoute(await params);

    const { searchParams } = request.nextUrl;
    const { page, pageSize } = await parsePaginationFromUrl(searchParams);

    // Fetch paginated comments directly from the database using videoId
    const comments = await prisma.comment.findMany({
      where: { videoId: id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    if (!comments) return NextResponse.json({ error: "No comments found for this Video" }, { status: 404 });

    // Get total count for pagination
    const total = await prisma.comment.count({
      where: { videoId: id }
    });

    // Return paginated response
    const response: PaginatedResponse<Comment> = { data: comments, total, page, pageSize };
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error, 'GET comments');
  }
}

// NOTE: Not in use
export const getCommentByIdUrl = (commentId: string) =>
  `/api/comments/${commentId}`;

export async function GetCommentById(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const id = parseIdFromRoute(await params);
    const comment = await prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    return NextResponse.json(comment);
  } catch (error) {
    return handleApiError(error, 'GET comment by ID');
  }
}


// ==== POST ====
export const createCommentUrl = (videoId: string) =>
  `/api/videos/${videoId}/comments`;

export async function createComment(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const id = parseIdFromRoute(await params);
  
    const body = await CommentCreateValidator.validate(await request.json());
    const { text } = body;

    // Check if video exists (required validation)
    const videoExists = await prisma.video.findUnique({
      where: { id },
      select: { id: true }
    });
    if (!videoExists) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    // Create a new comment in the database
    const comment = await prisma.comment.create({
      data: { text, videoId: id },
    });

    // Return the created comment with 201 status
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST comment');
  }
}

