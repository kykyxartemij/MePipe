# Using the in-process server cache (usage guide)

This document explains how to use the `getOrCreate` in-process cache found at `src/lib/serverCache.ts`.

Goals
- Deduplicate concurrent identical backend requests (singleflight).
- Cache short-lived responses to reduce DB load for repeated identical queries.

Quick example (copy/paste into your service file)

```ts
// Example: how to use getOrCreate in a route handler (do NOT modify other files automatically)
import { getOrCreate } from '@/lib/serverCache';
import { prisma } from '@/lib/prisma';

export async function getSimilarVideosExample(videoId: string, page = 1, pageSize = 10) {
  // 1) fetch ids of genres for the source video
  const src = await prisma.video.findUnique({ where: { id: videoId }, select: { genres: { select: { id: true } } } });
  if (!src) return null;
  const genreIds = src.genres.map(g => g.id);

  // 2) build a stable cache key (order genres to avoid duplicates)
  const genresKey = genreIds.length ? [...genreIds].sort().join(',') : 'none';
  const key = `similar:${videoId}:g:${genresKey}:p:${page}:s:${pageSize}`;

  // 3) pick a TTL (ms) and let the cache dedupe inflight requests
  const TTL_MS = 30_000; // 30s — tune for your app

  const related = await getOrCreate(key, TTL_MS, async () => {
    const where: any = { id: { not: videoId } };
    if (genreIds.length) where.genres = { some: { id: { in: genreIds } } };
    return prisma.video.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { publishedAt: 'desc' } });
  });

  return related;
}
```

Notes and best practices
- The provided `getOrCreate` is an in-process cache: it only dedupes and caches within the current Node process. If your app runs multiple instances (horizontal scaling), each instance has its own cache.
- Use short TTLs for frequently changing data, or perform explicit invalidation when writes occur.
- To invalidate, call `del(key)` from `src/lib/serverCache.ts` where appropriate (e.g., after creating/updating/deleting a video), or compute a deterministic key pattern to delete.
- Keep cache keys deterministic and include all request-relevant parameters (ids, page, pageSize, filters).

Invalidate on writes (example)

```ts
// after you update or create videos that affect related queries
import { del } from '@/lib/serverCache';

// if you used keys like `similar:${videoId}:g:${genresKey}:p:${page}:s:${pageSize}`
// you can either explicitly remove known keys or call `clear()` to reset (coarse)
del(`similar:${videoId}:g:...`);
```

Upgrading to cross-instance (Redis)
- For multi-instance dedupe and persistence, use a distributed cache (Redis) + a small locking approach or a server-side singleflight library.
- Options:
  - `cache-manager` with `cache-manager-ioredis` and use its `wrap()`/`get()/set()` semantics.
  - Implement a lock with `SETNX` + TTL or use libraries that provide distributed locks and singleflight behavior.
- With Redis you get cross-instance cache hits; expect slightly higher latency than in-memory cache.

Observability
- Add metrics for cache hits/misses and average factory duration so you can tune TTLs.

When to prefer this pattern
- Good for read-heavy endpoints where identical requests are common (e.g., similar videos, popular lists).
- For write-heavy or strongly-consistent requirements, prefer short TTLs or invalidate on writes.

If you want, I can add a small example that shows `cache-manager` + Redis usage (no changes to your existing code). Reply if you'd like that. 
