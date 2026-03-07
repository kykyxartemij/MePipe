# MePipe — Onboarding Guide

Quick reference for understanding the project structure, patterns, and how things connect.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Paste your Prisma Postgres DATABASE_URL into .env

# 3. Generate Prisma client (creates generated/prisma/)
npm run db:generate

# 4. Push schema to database
npm run db:push

# 5. Seed sample data
npm run db:seed

# 6. Start dev server
npm run dev
```

---

## Project Structure

```
prisma/
  schema.prisma        ← Database schema (PostgreSQL)
  seed.ts              ← Seeds genres + sample videos
prisma.config.ts       ← Prisma config (datasource URL from env)
generated/prisma/      ← Auto-generated Prisma Client (gitignored)

src/
  app/                 ← Next.js App Router (pages + API routes)
    api/               ← REST API endpoints
      video/           ← /api/video (GET paged, POST create)
        [id]/          ← /api/video/:id (GET single)
          comments/    ← /api/video/:id/comments (GET, POST)
          similar/     ← /api/video/:id/similar (GET)
        search/        ← /api/video/search?freeText=... (GET)
      genre/           ← /api/genre (GET all, POST create)
    video/             ← Video pages
      page.tsx         ← /video — grid of all videos
      [id]/page.tsx    ← /video/:id — single video page (Server Component)
    upload/            ← /upload — video upload form
  services/            ← Business logic (called by API routes)
  models/              ← TypeScript interfaces + Yup validators
  hooks/               ← Shared React Query hooks
  lib/                 ← Utilities (prisma client, query keys, etc.)
  components/          ← Reusable UI components
  providers/           ← React Query provider (wraps app)
```

---

## How the Stack Connects

### Next.js App Router

Pages live in `src/app/`. Each folder = a route segment:

- `src/app/video/page.tsx` → renders at `/video`
- `src/app/video/[id]/page.tsx` → renders at `/video/:id` (dynamic segment)
- `src/app/api/video/route.ts` → API endpoint at `/api/video`

**Server Components** (default) run on the server — they can call Prisma directly.
**Client Components** (`"use client"`) run in the browser — they fetch via API routes.

### API Route → Service Pattern

```
src/app/api/video/route.ts        ← Thin route handler (delegates to service)
    ↓ calls
src/services/video.service.ts     ← Business logic + Prisma queries
    ↓ uses
src/lib/prisma.ts                 ← Singleton Prisma Client
```

Route files are thin — they just parse the request and delegate to services.
Services contain all the Prisma queries and business logic.

---

## Prisma (ORM)

### Schema → Client → Queries

1. **Schema** (`prisma/schema.prisma`) defines models
2. **Generate** (`npm run db:generate`) creates typed client in `generated/prisma/`
3. **Push** (`npm run db:push`) syncs schema to database
4. **Query** using the typed client in your services

### Key Prisma Patterns

#### Finding records

```typescript
// Single record by ID
const video = await prisma.video.findUnique({ where: { id } });

// List with pagination
const videos = await prisma.video.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { publishedAt: 'desc' },
});

// Count (for pagination total)
const total = await prisma.video.count({ where });
```

#### Filtering (contains, insensitive)

```typescript
// Case-insensitive text search
const where = {
  title: { contains: 'bunny', mode: 'insensitive' as const },
};
```

#### Relations (include, connect)

```typescript
// Include related data (JOIN in one query)
const video = await prisma.video.findUnique({
  where: { id },
  include: { genres: true }, // Returns video with genres array
});

// Filter by relation
const videos = await prisma.video.findMany({
  where: {
    genres: { some: { name: { contains: 'action', mode: 'insensitive' } } },
  },
});

// Connect existing genres when creating a video
const video = await prisma.video.create({
  data: {
    title: 'My Video',
    videoUrl: '/uploads/file.mp4',
    genres: { connect: [{ id: 'genre-uuid-1' }, { id: 'genre-uuid-2' }] },
  },
});
```

#### Many-to-Many (implicit)

Genre ↔ Video is an **implicit many-to-many** relation.
Prisma auto-creates a join table `_GenreToVideo` — you never touch it directly.
Neither model stores the other's IDs. Use `connect`/`disconnect` to manage.

### Prisma Postgres + Accelerate

- `DATABASE_URL` points to `prisma+postgres://accelerate.prisma-data.net/...`
- Accelerate acts as a connection pooler between your app and the database
- Required for serverless environments (Vercel) where direct connections would exhaust the pool
- Free tier: 100k operations/month (one `prisma.video.findMany()` = 1 operation)

---

## React Query (Caching)

### How It Saves Operations

All client-side data fetching uses React Query via hooks in `src/hooks/` and `src/app/video/hooks/`.

**Cache settings** (configured in `QueryProvider.tsx`):

- `staleTime: 3 minutes` — data is considered fresh for 3 min, no refetch
- `gcTime: 10 minutes` — cached data kept in memory for 10 min after component unmounts

This means:

- First visit to `/video` → 1 API call → 1 DB operation
- Navigate away and back within 3 min → **0 API calls, 0 DB operations**
- After 3 min → refetches in background

### Query Key Structure

```typescript
// src/lib/queryKeys.ts
queryKeys.video.paged(freeText); // ["video", "paged", { freeText }]
queryKeys.video.search(freeText); // ["video", "search", { freeText }]
queryKeys.video.similar(videoId, page, size); // ["video", "similar", id, { page, size }]
queryKeys.comment.pagedByVideo(videoId); // ["comment", "video", id, { pageSize }]
queryKeys.genre.list(); // ["genre", { q: null }]
```

Query keys determine cache identity — same key = cached result reused.

### Hooks

| Hook               | File                           | Purpose                    |
| ------------------ | ------------------------------ | -------------------------- |
| `usePagedVideos`   | `video/hooks/useVideoHooks.ts` | Infinite scroll video grid |
| `useSimilarVideos` | `video/hooks/useVideoHooks.ts` | Related videos sidebar     |
| `useVideoSearch`   | `video/hooks/useVideoHooks.ts` | Search bar suggestions     |
| `useGenres`        | `hooks/useGenres.ts`           | Genre list for upload form |
| `useSearchField`   | `hooks/useSearchField.ts`      | Wires search hook to UI    |

---

## Yup (Validation)

Runtime validation for API inputs. Lives in `src/models/`.

```typescript
// Define a validator
export const CommentCreateValidator = yup.object({
  text: yup
    .string()
    .required('Comment text is required')
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long'),
});

// Use in a service
const body = await CommentCreateValidator.validate(await request.json());
// Throws yup.ValidationError if invalid → caught by handleApiError → 400 response
```

Validators are also used client-side with `react-hook-form` via `@hookform/resolvers/yup`.

---

## API URL Centralization

All API URLs are defined in `src/lib/apiUrl.ts`:

```typescript
API.video.paged(page, pageSize, freeText); // /api/video?page=1&pageSize=100&freeText=...
API.video.single(videoId); // /api/video/:id
API.video.similar(videoId, page, pageSize); // /api/video/:id/similar?...
API.video.search(freeText); // /api/video/search?freeText=...
API.comment.pagedByVideo(videoId, p, ps); // /api/video/:id/comments?...
API.comment.create(videoId); // /api/video/:id/comments
API.genre.list(); // /api/genre
```

---

## Search Flow (NavBar → API → DB)

The search bar in the Navbar has built-in complexity for smooth UX:

```
User types "bunny"
  → ArtComboBox (debounced, 300ms)
    → useSearchField hook
      → useVideoSearch hook (React Query)
        → GET /api/video/search?freeText=bunny
          → getSearchSuggestions() in video.service.ts
            → Single Prisma query: title OR genre name match
              → Returns up to 8 video titles as suggestions

User presses Enter or selects suggestion
  → router.push("/video?freeText=bunny")
    → VideoGrid re-renders with usePagedVideos("bunny")
      → GET /api/video?page=1&pageSize=100&freeText=bunny
        → getPagedVideos() in video.service.ts
          → Single Prisma query with OR filter (title + genre relation)
```

**Key optimization**: Search suggestions and paged results both use a single Prisma query
that matches against both video titles and genre names via relational filtering.
No separate "get genre IDs" call needed — Prisma handles the join internally.

---

## NPM Scripts

| Script        | Command                              | When to use                         |
| ------------- | ------------------------------------ | ----------------------------------- |
| `dev`         | `next dev`                           | Start dev server                    |
| `build`       | `next build`                         | Production build                    |
| `db:generate` | `prisma generate`                    | After cloning or changing schema    |
| `db:push`     | `prisma db push`                     | After changing schema (syncs to DB) |
| `db:seed`     | `tsx --env-file=.env prisma/seed.ts` | Populate sample data                |
| `db:studio`   | `prisma studio`                      | Visual database browser             |

---

## Common Patterns

### Server Component with Direct DB Access

```typescript
// src/app/video/[id]/page.tsx — runs on server, calls Prisma directly
export default async function Page({ params }) {
  const video = await prisma.video.findUnique({
    where: { id },
    include: { genres: true },
  });
  return <VideoPlayer src={video.videoUrl} />;
}
```

### Client Component with React Query

```typescript
// "use client" — runs in browser, fetches via API
const { data, isLoading } = useSimilarVideos(videoId);
```

### Error Handling

All service functions wrap logic in try/catch and delegate to `handleApiError()`,
which maps Yup validation errors → 400, Prisma P2025 → 404, and everything else → 500.
