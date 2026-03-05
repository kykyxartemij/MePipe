import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errorHandler";

// ==== GET ALL ====
export const getGenresUrl = (page?: number, pageSize?: number, name?: string) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (pageSize) params.set("pageSize", String(pageSize));
  if (name) params.set("name", name);
  return `/api/genres?${params.toString()}`;
};

export async function getGenres(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = searchParams.get("page");
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const name = searchParams.get("name") ?? "";

    const where = name ? { name: { contains: name, mode: "insensitive" as const } } : {};

    if (!page) {
      const genres = await prisma.genre.findMany({
        where,
        orderBy: { name: "asc" },
      });
      return NextResponse.json(genres);
    }

    const [genres, total] = await Promise.all([
      prisma.genre.findMany({
        where,
        skip: (Number(page) - 1) * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
      }),
      prisma.genre.count({ where }),
    ]);

    return NextResponse.json({ genres, total, page: Number(page), pageSize });
  } catch (error) {
    return handleApiError(error, 'GET genres');
  }
}

// ==== CREATE ====
export const createGenreUrl = () => `/api/genres`;

export async function createGenre(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Genre name is required" }, { status: 400 });
    }

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
