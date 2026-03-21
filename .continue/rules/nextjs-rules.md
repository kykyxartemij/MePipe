---
description: MePipe project rules — applied to all tasks in this workspace.
alwaysApply: true
---

## Response style

- Be concise. Answer in the minimum words needed.
- Think briefly — 2–3 sentences of internal reasoning max. Only think longer for complex algorithmic problems.
- Show code directly. Skip preambles like "here is the code" or "sure!".
- Do not repeat what was asked. Do not summarize after answering.
- If a question is about React, Next.js, or general JS/TS — give a short direct answer from knowledge. No need for lengthy explanations.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · React Query 5 · Prisma 7 · PostgreSQL (Neon serverless) · Yup 1.7 · React Hook Form 7 · Axios

## Three-tier frontend architecture

```
app/           — thin routing only. No logic. Server Components by default.
page/          — feature components. Always "use client". State via React Query hooks.
components/ui/ — Art library primitives (ArtInput, ArtButton, ArtDialog, etc.)
```

- `app/` files just import from `page/` and pass route params down. No business logic.
- `page/` components handle all state, data fetching, and composition.
- `components/ui/` is the reusable Art library — generic, no feature knowledge.

## Loading / skeleton pattern

Components own their skeleton via a `loading` prop. `loading.tsx` is one line:

```tsx
// page/video/VideoPage.tsx
export default function VideoPage({ videoId = '', loading = false }) {
  const { data } = useById(videoId, { enabled: !loading });
  if (loading || !data) return <Skeleton />;
  return <div>...</div>;
}

// app/video/[id]/loading.tsx
export default function Loading() { return <VideoPage loading />; }

// app/video/[id]/page.tsx
export default async function Page({ params }) {
  const { id } = await params;
  return <VideoPage videoId={id} />;
}
```

Skeleton only where content causes layout shift. Static structure (headings, labels) renders immediately.

## Hooks (hooks/*.hooks.ts)

One file per domain. All mutation side effects live inside the hook — not at the call site:

```ts
export const useCreateVideo = () => {
  const { enqueueSuccess, enqueueError } = useArtSnackbar();
  const { close } = useArtDialog();
  return useMutation({
    onSuccess: () => { enqueueSuccess('Uploaded!'); close(); },
    onError:   (err) => enqueueError(err),
  });
};
```

- URLs via `apiUrl.ts` (`API.video.create()`)
- Cache keys via `queryKeys.ts`
- After mutation: `queryClient.invalidateQueries` + `invalidateCache()` for server cache

## Models (models/*.models.ts)

Each domain has:
- `FEModel` — what the client receives
- `LightModel` — stripped version for lists
- `WriteModel` / `CreateValidator` — Yup schema + `InferType` for form/API input

**Reuse validators on both sides.** The same `VideoCreateValidator` used in the API route can power the client form via `yupResolver`:
```ts
// FE form (React Hook Form)
const form = useForm({ resolver: yupResolver(VideoCreateValidator) });
// BE route — same schema validates the incoming body
await VideoCreateValidator.validate(body);
```

## Server caching (serverCache.ts)

Always wrap Prisma reads in `cached()`. **Neon free tier = 5 GB/month transfer — uncached queries burn the budget.**

```ts
// cached(queryFn, cacheKey, ttl?) — ttl defaults to DEFAULT_TTL (90s), don't override unless needed
const data = await cached(
  () => prisma.video.findMany({ ... }),
  CACHE_KEYS.video.paged(page, size)
);
```

Never cache `null` — use `findUniqueOrThrow` not `findUnique` for by-ID queries.

After mutations invalidate server cache and React Query:
```ts
await invalidateCache(...CACHE_KEYS.video.invalidate());
queryClient.invalidateQueries({ queryKey: queryKeys.video.invalidate.list() });
```

## Pagination

`PaginatedResponse<T>` — always detect last page via `data.length < pageSize`. **Never run a separate `COUNT(*)` query** — it doubles DB operations for no benefit with infinite scroll.

## Error handling

- Route handlers → `handleApiError(err)` (maps to HTTP status)
- Hooks → `enqueueError(err)` from `useArtSnackbar()`
- Client errors typed as `ApiError` (from `@/models/api-error`)

## Art component library (components/ui/)

- All prefixed `Art*`. Use `forwardRef`, accept standard HTML attributes.
- Base styling via `.art-field`, `.art-field-wrapper`, `.art-field-inner` CSS classes.
- `ArtSnackbar` → `useArtSnackbar()` hook — `enqueue`, `enqueueSuccess`, `enqueueError`, `close`
- `ArtDialog` → `<ArtDialog>` (trigger wrapper), `<ArtConfirmDialog>` (yes/no), `useArtDialog()` (imperative `show`/`close`)
- Both providers are mounted once in `app/layout.tsx` — do not add them again in pages.
- **No `React.memo` or `useMemo`** on feature/page components. Only inside Art library components.

## Styling rules

- Feature layout → **Tailwind inline classes only**
- Shared component styles → `@layer components` in `globals.css`
- **`globals.css` is exclusively for Art component CSS** — never add feature-specific styles there
- CSS tokens: `--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--art-accent`
- Color modifiers via `.art-primary`, `.art-warning`, `.art-success`, `.art-danger` classes
- Dark theme only
