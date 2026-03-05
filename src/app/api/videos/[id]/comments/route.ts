import { NextRequest } from "next/server";
import { createComment, getPagedCommentsByVideoId } from "@/services/comment.service";

// ==== GET ====
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return getPagedCommentsByVideoId(request, params);
}

// ==== POST ====
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return createComment(request, params);
}


