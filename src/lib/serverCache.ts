import { unstable_cache, revalidateTag } from 'next/cache';

export const DEFAULT_TTL = 90; // 90 seconds
export const DEFAULT_NUMBER_TTL = 60 * 60 * 12; // 12 hours

// TODO: Small renovate in props usage, make cached and cachedNumber more similar to use

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
 *
 * @example
 * invalidateCache('comment', `comment:${videoId}`);
 */
export function invalidateCache(...tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

// ==== CACHED NUMBER (delta cache pattern) ====
//
// Problem: you have a count cached for 12h. On createComment you don't want to
// invalidate the whole video cache just to bump one number.
//
// Solution — two independent cache entries:
//   base  (Cache 1): real count fetched from DB on cache miss
//   delta (Cache 2): mutations accumulated since last DB fetch
//   result = base + delta
//
// On createComment: call addCacheNumber → delta += 1, zero DB ops, video cache untouched.
// On cache expiry:  both reset, next read fetches fresh count from DB.
//
// Tag design (keeps count separate from list invalidation):
//   baseTags:  ['<key[0]>', ...]  e.g. ['comment:count', videoId]
//   deltaTags: ['<key[0]>', '__delta__:<key[0]>']
//
// Known trade-off: two simultaneous addCacheNumber calls can race → off by 1.
// Acceptable for approximate counts (comments, views, likes).

const DELTA_NOT_SET = -1 as const;

function toDeltaKey(key: string[]): string[] {
  return ['__delta__', ...key];
}

function toDeltaTag(baseTag: string): string {
  return `__delta__:${baseTag}`;
}

// Overwrites a delta cache entry with a new value.
// Pattern: invalidate delta tag → recreate factory with new value → call immediately.
// The result is stored in Vercel's shared cache infrastructure on that call.
async function writeDelta(
  dKey: string[],
  value: number,
  dTag: string,
  bTag: string,
  ttl: number,
): Promise<void> {
  revalidateTag(dTag); // only invalidate delta, NOT the base
  const fn = unstable_cache(async () => value, dKey, { revalidate: ttl, tags: [bTag, dTag] });
  await fn();
}

/**
 * Returns a cached number (base count from DB + accumulated delta).
 * On cache miss, calls dbFn() and initializes delta to 0.
 *
 * Use a key that's SEPARATE from your list cache to avoid unintended invalidation.
 * e.g. ['comment:count', videoId] instead of ['comment', videoId]
 *
 * @example
 * const total = await cachedNumber(
 *   CACHE_KEYS.comment.count(videoId),
 *   () => prisma.comment.count({ where: { videoId } }),
 * );
 */
export async function cachedNumber(
  key: string[],
  dbFn: () => Promise<number>,
  ttl = DEFAULT_NUMBER_TTL,
): Promise<number> {
  const dKey = toDeltaKey(key);
  const bTag = key[0];
  const dTag = toDeltaTag(bTag);

  const baseFn = unstable_cache(async () => dbFn(), key, {
    revalidate: ttl,
    tags: key,
  });

  const deltaFn = unstable_cache(
    async () => DELTA_NOT_SET as number,
    dKey,
    { revalidate: ttl, tags: [bTag, dTag] },
  );

  const [base, delta] = await Promise.all([baseFn(), deltaFn()]);

  // Delta is cold (base was just fetched) → initialize delta to 0
  if (delta === DELTA_NOT_SET) {
    await writeDelta(dKey, 0, dTag, bTag, ttl);
    return base;
  }

  return base + delta;
}

/**
 * Increments the cached delta by `by` (default 1).
 * Skips if cache is cold (base not yet fetched — next read handles it from DB).
 *
 * @example
 * await prisma.comment.create({ data: { text, videoId } });
 * await addCacheNumber(CACHE_KEYS.comment.count(videoId));
 */
export async function addCacheNumber(key: string[], by = 1, ttl = 60 * 60 * 12): Promise<void> {
  const dKey = toDeltaKey(key);
  const bTag = key[0];
  const dTag = toDeltaTag(bTag);

  const deltaFn = unstable_cache(
    async () => DELTA_NOT_SET as number,
    dKey,
    { revalidate: ttl, tags: [bTag, dTag] },
  );

  const current = await deltaFn();
  if (current === DELTA_NOT_SET) return;

  await writeDelta(dKey, current + by, dTag, bTag, ttl);
}

/**
 * Decrements the cached delta by `by` (default 1, floor 0).
 * Skips if cache is cold.
 *
 * @example
 * await prisma.comment.delete({ where: { id } });
 * await removeCacheNumber(CACHE_KEYS.comment.count(videoId));
 */
export async function removeCacheNumber(key: string[], by = 1, ttl = 60 * 60 * 12): Promise<void> {
  const dKey = toDeltaKey(key);
  const bTag = key[0];
  const dTag = toDeltaTag(bTag);

  const deltaFn = unstable_cache(
    async () => DELTA_NOT_SET as number,
    dKey,
    { revalidate: ttl, tags: [bTag, dTag] },
  );

  const current = await deltaFn();
  if (current === DELTA_NOT_SET) return;

  await writeDelta(dKey, Math.max(0, current - by), dTag, bTag, ttl);
}
