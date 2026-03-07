import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/errorHandler';
import { GenreCreateValidator } from '@/models/genre.models';
import { CACHE_KEYS } from '@/lib/cacheKeys';
import { cached, invalidateCache } from '@/lib/serverCache';

// ==== GET ALL ====
export async function getGenres() {
  try {
    const genres = await cached(
      () =>
        prisma.genre.findMany({
          orderBy: { name: 'asc' },
        }),
      CACHE_KEYS.genre.all()
    );
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

    const genre = await prisma.genre.create({ data: { name } });
    invalidateCache(...CACHE_KEYS.genre.invalidate());
    return NextResponse.json(genre, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST genre');
  }
}
