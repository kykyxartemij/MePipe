import { unstable_cache, revalidateTag } from 'next/cache';

export const DEFAULT_TTL = 90; // 90 seconds

/**
 * Server-side cache wrapper using Next.js `unstable_cache`.
 * Shared across ALL users and serverless instances — not per-browser.
 *
 * @example
 * const comments = await cached(
 *   () => prisma.comment.findMany({ where: { videoId: id } }),
 *   ['comment', id, String(page), String(pageSize)],
 * );
 */
export async function cached<T>(
  queryFn: () => Promise<T>,
  cacheKey: string[],
  ttl: number = DEFAULT_TTL,
): Promise<T> {
  const cachedFn = unstable_cache(async () => queryFn(), cacheKey, {
    revalidate: ttl,
    tags: cacheKey,
  });
  return cachedFn();
}

/**
 * Invalidates cached entries by tag.
 *
 * @example
 * invalidateCache('comment', `comment:${videoId}`);
 */
export function invalidateCache(...tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

