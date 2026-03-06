// NOTE: Don't care for now. But should be improved and tested.
import { NextResponse } from "next/server";

export function handleApiError(error: any, context: string) {
  console.error(`${context} error:`, error); // Use a proper logger in prod

  if (error.name === 'ValidationError') {
    return NextResponse.json({ error: error.message }, { status: 400 });
    // TODO: Responsive UI, to show user-friendly messages, pointing in UI where the validation failed.
  }

  // Prisma-specific errors
  if (error.code) {
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }
    if (error.code === 'P2003') { // Foreign key constraint violation
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    // Add more Prisma codes as needed
  }

  // Default to 500
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}