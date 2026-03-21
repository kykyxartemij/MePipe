# Refactoring Progress & Remaining TODOs (v2)

Status tracking for MePipe FE refactoring. See original `ClaudeSuggestionsDocumentation.md` for detailed implementation guides.

---

## ✅ Completed

| Item | Type | Details |
|------|------|---------|
| **1.6** Wire up `app/page.tsx` | TODO | Now imports and uses `Homepage` with correct `searchParams` |
| **1.7** Upload loading skeleton | TODO | Refactored to use `next/dynamic` at page level (no separate loading.tsx) |
| **2.4** Direct Prisma in page | Bug | Fixed: `VideoPage` now uses `useById` hook + lazy loading |
| **2.6** Duplicate RelatedVideos | Cleanup | Deleted `RelatedVideos.tsx`, kept `SimilarVideos.tsx` only |
| **3.3** Centralize inline styles | Improvement | All styles moved to `globals.css` (@layer components/utilities) |
| **3.4** Type safety for API responses | Improvement | `VideoGrid` and all components properly typed with models |

---

## 🔄 Architectural Improvements Made

### Page-Level Lazy Loading
- **Pattern**: `next/dynamic` at `app/**/page.tsx` level, not in components
- **Loading**: Minimal skeleton components defined in page, shown via dynamic fallback
- **Result**: Cleaner components, better code splitting, no `loading.tsx` files cluttering the structure

### Styling Strategy (Tailwind v4)
- **Import**: `@import "tailwindcss"` (v4 syntax)
- **Utilities**: `.text-muted`, `.bg-muted`, `.border-muted` (CSS custom properties)
- **Components**: `.btn`, `.art-field-*`, `.video-page`, `.video-grid`, `.genre-badge`
- **Result**: Single source of truth in `globals.css` — change theme in one place

### Component Architecture
- **app/** — Thin routing + lazy loading orchestration
- **page/** — Feature-specific components (pure, no lazy loading)
- **components/ui/** — Reusable Art component library (base styling via @layer)
- **Result**: Clear separation of concerns, easy to understand and maintain

### Data Fetching (FE)
- **React Query hooks** for all data fetching (organized by domain)
- **Server cache** via `cached()` + Prisma Accelerate for BE
- **Infinite scroll** via `useInfiniteQuery` — no COUNT(*) queries needed
- **Result**: Minimal DB load, fast page loads, clear data flow

---

## 🎯 Remaining TODOs

| Priority | Item | Type | Status |
|----------|------|------|--------|
| **High** | 2.1 Broken URL in `useCommentById` | Bug | Remove or fix with proper API endpoint |
| **High** | 2.2-2.3 Inconsistent axios imports | Bug | All hooks should import from `@/lib/axiosClient` |
| **High** | 2.5 `include` + `select` conflict in `getPagedVideos` | Bug | Fix Prisma query (drop `select` or nest genres in it) |
| **Medium** | 1.3 Renovate `ArtDebounceInput` | TODO | Extract `useDebouncedCallback`, simplify component |
| **Medium** | 1.4 Update `ArtComboBox` | TODO | Minor refinements based on other component updates |
| **Low** | 1.1 Build `ArtSnackbar` | TODO | Context provider + queue pattern (deferred) |
| **Low** | 1.2 Build `ArtDialog` | TODO | Context + Promise-based API (deferred) |
| **Low** | 1.5 `ArtIcon` tooltip | TODO | Add `label` → tooltip mapping |
| **Low** | 3.1-3.2 Error display + loading states | Improvement | Once `ArtSnackbar` ready, add to mutations |
| **Low** | 3.5 Extract video duration formatter | Improvement | Move `fmt()` to `lib/formatDuration.ts` |
| **Low** | 3.6 Keyboard accessibility for `ArtComboBox` | Improvement | Add ARIA attributes for screen readers |
| **Low** | 3.7 Add comment delete (CRUD) | Improvement | Full delete support with UI button |
| **Low** | 3.8 Extract `useDebouncedValue` hook | Improvement | Simplify `SearchField` logic |
| **Low** | 3.9 Add `displayName` to page components | Improvement | React DevTools naming consistency |

---

## 📚 Documentation Added to MEPIPE.md

New sections (lines 219–892):
1. **Frontend Architecture & Page Structure** — Three-tier separation (app → page → components)
2. **Code Splitting & Dynamic Imports** — Why `next/dynamic`, loading skeleton strategy
3. **Styling Strategy** — Tailwind v4, CSS variables, @layer patterns
4. **Component Library Design** — Art component internals, customization via Tailwind
5. **Data Fetching Patterns** — React Query hooks, server caching, infinite scroll

---

## 🚀 Next Steps

1. **Fix high-priority bugs** (2.1, 2.2-2.3, 2.5) — ensures consistency across codebase
2. **Defer complex TODOs** (ArtSnackbar, ArtDialog) — they require custom provider patterns
3. **QA/Testing** — verify TypeScript, run dev server, check performance
4. **Graduation documentation** — MEPIPE.md is now comprehensive and ready for presentation

---

**Last updated:** 2026-03-12
