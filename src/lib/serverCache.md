# Server-Side Cache (`cached()`)

A simple utility for caching **any async operation** (DB queries, API calls, etc.)
on the **server side** using Next.js `unstable_cache` + Vercel's cache layer.

---

## Why?

- The cache lives on the **server**, NOT in the browser.
- It is **shared across ALL users** — if User A and User B make the same request,
  only one DB query happens (within the TTL window).
- On **Vercel**, the cache is shared across serverless instances.
- Protects your database from redundant identical queries.

---

## How It Works

```
Timeline (TTL = 60 seconds)
───────────────────────────────────────────────────

0:00  User A → GET /api/video/123/comments?page=1
      Cache MISS → Prisma query runs → result cached
      DB operations: 1

0:05  User B → GET /api/video/123/comments?page=1
      Cache HIT → cached result returned
      DB operations: 0

0:30  User C → GET /api/video/123/comments?page=1
      Cache HIT → cached result returned
      DB operations: 0

0:45  User D → GET /api/video/123/comments?page=2   ← different cache key
      Cache MISS → Prisma query runs → result cached
      DB operations: 1

1:01  User E → GET /api/video/123/comments?page=1
      Cache EXPIRED → Prisma query runs → cache refreshed
      DB operations: 1

Result: 5 requests, only 3 DB operations instead of 5
```

---

## Architecture

```
  User A ──┐
  User B ──┼──▶  Vercel Server
  User C ──┘
                 ┌─────────────────────┐
                 │  Server-Side Cache   │  ← cached() lives here
                 │  (shared by ALL      │    NOT in any browser
                 │   users & instances) │
                 └──────────┬──────────┘
                            │
                     cache MISS only
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Your Database     │  ← protected from spam
                 └─────────────────────┘
```

---

## Usage

### Import

```ts
import { cached, invalidateCache } from "@/lib/cache";
```

### Basic Example — Cache a Prisma Query

```ts
const comments = await cached(
  () => prisma.comment.findMany({
    where: { videoId: id },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  }),
  ["comments", id, String(page), String(pageSize)],
  60 // cache for 1 minute
);
```

### With Tags for Manual Invalidation

```ts
const comments = await cached(
  () => prisma.comment.findMany({
    where: { videoId: id },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  }),
  ["comments", id, String(page), String(pageSize)],
  60,
  ["comments", `comments:${id}`]  // tags for invalidation
);
```

### Invalidate After a Mutation

```ts
// After creating a new comment:
await prisma.comment.create({ data: commentData });

// Bust the cache so next GET returns fresh data:
invalidateCache("comments", `comments:${videoId}`);
```

---

## Full Real-World Example (comment.service.ts)

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cached, invalidateCache } from "@/lib/cache";
import { parseIdFromRoute } from "@/models";
import { parsePaginationFromUrl } from "@/models/paginated-response.model";
import { handleApiError } from "@/lib/errorHandler";

// ==== GET (with caching) ====

export async function getPagedCommentsByVideoId(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const id = parseIdFromRoute(await params);
    const { searchParams } = request.nextUrl;
    const { page, pageSize } = await parsePaginationFromUrl(searchParams);

    const comments = await cached(
      () => prisma.comment.findMany({
        where: { videoId: id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      ["comments", id, String(page), String(pageSize)],
      60,
      ["comments", `comments:${id}`]
    );

    if (!comments) {
      return NextResponse.json(
        { error: "No comments found for this Video" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: comments, page, pageSize });
  } catch (error) {
    return handleApiError(error, "GET comments");
  }
}

// ==== POST (with cache invalidation) ====

export async function createComment(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const videoId = parseIdFromRoute(await params);
    const body = await request.json();

    const comment = await prisma.comment.create({
      data: { ...body, videoId },
    });

    // Invalidate cache so next GET returns fresh data
    invalidateCache("comments", `comments:${videoId}`);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST comment");
  }
}
```

---

## API Reference

### `cached<T>(queryFn, cacheKey, ttl?, tags?): Promise<T>`

| Parameter  | Type               | Default    | Description                                         |
| ---------- | ------------------ | ---------- | --------------------------------------------------- |
| `queryFn`  | `() => Promise<T>` | (required) | Function returning a promise. **Do NOT pre-await.** |
| `cacheKey` | `string[]`         | (required) | Unique key parts identifying this cache entry.      |
| `ttl`      | `number`           | `60`       | Time-to-live in **seconds**.                        |
| `tags`     | `string[]`         | `cacheKey` | Tags for manual invalidation.                       |

### `invalidateCache(...tags: string[]): void`

Invalidates all cache entries matching the given tags.

---

## ⚠️ Important Notes

1. **Pass a function, not a result** — write `() => prisma.findMany(...)`,
   NOT `await prisma.findMany(...)`. The cache needs to control when the query executes.

2. **Works on Vercel out of the box** — Vercel's cache layer handles sharing
   across serverless instances automatically.

3. **For local development** — the cache still works but resets on every
   server restart (hot reload). This is normal.

4. **Only cache GET/read operations** — never cache mutations.