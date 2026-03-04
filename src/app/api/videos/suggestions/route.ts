import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/freeText";

const MAX_SUGGESTIONS = 8;

/**
 * GET /api/videos/suggestions?freeText=...
 *
 * Returns up to 8 distinct title suggestions using substring matching
 * against video titles and genre names.
 *
 * For fuzzy matching improvements see src/lib/freetext-filtering-improvements.md.
 */
export async function GET(req: NextRequest) {
  const q = normalizeText(req.nextUrl.searchParams.get("freeText") ?? "");
  if (q.length < 1) return NextResponse.json([]);

  // Find genre IDs that match the query
  const matchingGenres = await prisma.genre.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    select: { id: true },
  });
  const genreIds = matchingGenres.map((g) => g.id);

  const videos = await prisma.video.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        ...(genreIds.length > 0
          ? [{ genreIds: { hasSome: genreIds } }]
          : []),
      ],
    },
    select: { title: true },
    take: MAX_SUGGESTIONS,
    orderBy: { publishedAt: "desc" },
    distinct: ["title"],
  });

  return NextResponse.json(videos.map((v) => v.title));
}
