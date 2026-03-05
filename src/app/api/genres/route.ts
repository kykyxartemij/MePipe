import { NextRequest } from "next/server";
import { getGenres, createGenre } from "@/services/genre.service";

export async function GET(request: NextRequest) {
  return getGenres(request);
}

export async function POST(request: NextRequest) {
  return createGenre(request);
}


