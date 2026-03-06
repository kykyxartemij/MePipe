// NOTE: This file currently also used as example of API route structure and error handling.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CommentCreateValidator, Comment } from "@/models/comment.models";
import { parseIdFromRoute } from "@/models";
import { parsePaginationFromUrl } from "@/models/paginated-response.model";
import { handleApiError } from "@/lib/errorHandler";

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
    const comments = await prisma.comment.findMany({
      where: { videoId: id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    if (!comments) return NextResponse.json({ error: "No comments found for this Video" }, { status: 404 });

    // const total = await prisma.comment.count({ where: { videoId: id } }); // Disabled: saves a DB operation per request

    // Return paginated response
    return NextResponse.json({ data: comments, page, pageSize });
  } catch (error) {
    return handleApiError(error, 'GET comments');
  }
}

// NOTE: Not in use
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

export async function createComment(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const id = parseIdFromRoute(await params);
  
    const { text } = await CommentCreateValidator.validate(await request.json());

    const comment = await prisma.comment.create({
      data: { text, videoId: id },
    });

    // Return the created comment with 201 status
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST comment');
  }
}

