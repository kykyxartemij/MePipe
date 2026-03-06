# Server-side caching (in-process) — notes

This project includes a tiny in-process cache utility at `src/lib/serverCache.ts`.

Goal
- Deduplicate concurrent identical requests (singleflight) and cache results for a short TTL.

How it works
- `getOrCreate(key, ttlMs, factory)`:
  - Returns cached value if present and not expired.
  - If a fetch for the same `key` is already in-flight, awaits the same Promise.
  - Otherwise calls `factory()` once, caches the result for `ttlMs`, and returns it.

Where used
- `getSimilarVideos` in `src/services/video.service.ts` uses the cache to avoid parallel identical DB queries for the same video+genres+page.

Notes & trade-offs
- Works well for single-node servers and development. Fast and simple.
- Not suitable for multi-instance scaling: each instance has its own cache. For cross-instance dedupe and persistence use Redis or another distributed cache.
- TTL must be tuned. For frequently changing data prefer short TTLs or explicit invalidation.
- The utility exposes `del(key)` and `clear()` for manual invalidation (used on writes if needed).
- Monitor cache hit/miss and inflight waits in production if you adopt this pattern.

Next steps (if you want to evolve this)
- Add metrics for hits/misses and average factory duration.
- Replace the in-memory store with `cache-manager` + Redis store for multi-instance support.
- Add background refresh / stale-while-revalidate to return stale quickly while refreshing in background.
