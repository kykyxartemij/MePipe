import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errorHandler";
import { GenreCreateValidator } from "@/models/genre.models";

// ==== GET ALL ====

export async function getGenres(request: NextRequest) {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(genres);
  } catch (error) {
    return handleApiError(error, 'GET genres');
  }
}

// ==== CREATE ====

export async function createGenre(request: NextRequest) {
  try {
    const validatedData = await GenreCreateValidator.validate(await request.json());
    const { name } = validatedData;

    const existing = await prisma.genre.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "This genre already exists" }, { status: 409 });
    }

    const genre = await prisma.genre.create({ data: { name } });
    return NextResponse.json(genre, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST genre');
  }
}
