import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

/**
 * Server-side cache wrapper using Next.js `unstable_cache`.
 *
 * Wraps any async function (e.g. a Prisma query) with Vercel's
 * built-in server-side cache layer. The cache is shared across
 * ALL users and serverless instances — not per-browser.
 *
 * @param queryFn  - A function that returns a Promise. Do NOT await it before passing.
 * @param cacheKey - Array of strings that uniquely identify this cached entry.
 * @param ttl      - Time-to-live in seconds (default: 90).
 * @param tags     - Optional tags for manual invalidation via `invalidateCache()`.
 *
 * @example
 * const comments = await cached(
 *   () => prisma.comment.findMany({ where: { videoId: id } }),
 *   ["comment", id, String(page), String(pageSize)],
 *   60,
 *   ["comment", `comment:${id}`]
 * );
 */
export async function cached<T>(
  queryFn: () => Promise<T>,
  cacheKey: string[],
  ttl: number = 90,
  tags?: string[]
): Promise<T> {
  const cachedFn = unstable_cache(async () => queryFn(), cacheKey, {
    revalidate: ttl,
    tags: tags ?? cacheKey,
  });

  return cachedFn();
}

/**
 * Invalidates cached entries by tag.
 * Call this after a mutation (e.g. creating/deleting a comment)
 * to ensure the next request fetches fresh data.
 *
 * @param tags - One or more tags to invalidate.
 *
 * @example
 * await createComment(data);
 * invalidateCache("comment", `comment:${videoId}`);
 */
export function invalidateCache(...tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}
