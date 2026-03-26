import { NextRequest } from 'next/server';
import { getGenres, createGenre } from '@/services/genre.service';

export async function GET() {
  return getGenres();
}

export async function POST(request: NextRequest) {
  return createGenre(request);
}
