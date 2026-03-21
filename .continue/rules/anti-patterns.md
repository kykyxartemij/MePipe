---
description: MePipe anti-patterns — things to never do in this codebase.
alwaysApply: true
---

## Never do these

**Direct Prisma reads without `cached()`**
ESLint rule `no-uncached-prisma` will catch this. Every direct read hits Neon on every request.
```ts
// ❌
const videos = await prisma.video.findMany(...);

// ✅ — no TTL override needed, DEFAULT_TTL handles it
const videos = await cached(() => prisma.video.findMany(...), CACHE_KEYS.video.paged(p, s));
```

**`findUnique` inside `cached()`**
If the record doesn't exist, `findUnique` caches `null` for the entire TTL — requests return null even after the record is created.
```ts
// ❌
const video = await cached(() => prisma.video.findUnique({ where: { id } }), CACHE_KEYS.video.byId(id));

// ✅
const video = await cached(() => prisma.video.findUniqueOrThrow({ where: { id } }), CACHE_KEYS.video.byId(id));
```

**Business logic in route handlers (`app/api/**/route.ts`)**
Route handlers are thin. All logic belongs in `services/*.service.ts`.
```ts
// ❌ — logic in route
export async function GET(req) {
  const videos = await prisma.video.findMany({ where: ... });
  return NextResponse.json(videos);
}

// ✅ — delegate to service
export async function GET(req) {
  return getPagedVideos(req);
}
```

**Data fetching in `app/` layer**
`app/` is routing only. Feature components in `page/` own data fetching via hooks.

**Mutation side effects at the call site**
```ts
// ❌ — component knows too much
const { mutate } = useCreateVideo();
mutate(data, { onSuccess: () => { enqueueSuccess(...); close(); } });

// ✅ — hook owns all side effects
const { mutate } = useCreateVideo(); // onSuccess/onError handled inside the hook
mutate(data);
```

**`React.memo` / `useMemo` on feature/page components**
Only allowed inside `components/ui/` Art library. Feature components do not need it.

**Feature styles in `globals.css`**
`globals.css` is exclusively for Art component CSS. Feature layout uses Tailwind inline classes.

**Duplicate providers**
`ArtDialogProvider` and `ArtSnackbarProvider` are already in `app/layout.tsx`. Never add them again inside a page or component.

**`COUNT(*)` for pagination**
Detect last page via `data.length < pageSize` — that's what `getNextPage()` in `paginated-response.model.ts` does. A separate count query doubles DB operations.

**`next/dynamic` for regular components**
Next.js auto code-splits every route. Only use `next/dynamic` for genuinely heavy libraries (chart editors, 3D viewers) or components that are never needed on initial load.

**Hardcoded API URLs**
Always use `API.*` from `apiUrl.ts` and `queryKeys.*` from `queryKeys.ts`. Never write `/api/video` inline.

**`<Link>` without `prefetch` on internal routes**
Next.js 15 defaults to hover-only prefetch. Without explicit `prefetch`, quick clicks show a blank gap before the skeleton. ESLint rule `local/require-link-prefetch` enforces this.
```tsx
// ❌
<Link href={`/video/${id}`}>…</Link>

// ✅
<Link href={`/video/${id}`} prefetch>…</Link>
```

**Native `<img>` tags**
Always use `next/image` (`<Image>`). It handles optimization, lazy loading, and responsive sizing automatically.
```tsx
// ❌
<img src={video.thumbnailUrl} alt={video.title} />

// ✅
import Image from 'next/image';
<Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
```
