# Claude Suggestions & TODOs

Existing TODOs from the codebase + suggested improvements.

---

## 1. Existing TODOs

### 1.1 `ArtSnackbar.tsx` -- Build Custom Snackbar

**TODO**: "Make a custom copy of Notistack's Snackbar. Notistack is old + get experience with building such components."

**How to implement:**

Create a snackbar system with a React context provider + queue. Core pieces:

```
ArtSnackbarProvider (context + state)
  -> ArtSnackbarContainer (positioned fixed, renders queue)
       -> ArtSnackbar (individual toast with enter/exit animation)
```

Steps:
1. Create `ArtSnackbarContext` with `enqueueSnackbar(message, options)` and `closeSnackbar(id)`.
2. `ArtSnackbarProvider` manages a queue (`useState<SnackbarItem[]>`). Each item has `id`, `message`, `variant` (success/error/info/warning), `autoHideDuration`.
3. `ArtSnackbarContainer` renders at the bottom-right (or configurable), uses `position: fixed`.
4. Each `ArtSnackbar` auto-dismisses via `setTimeout`, with CSS transitions for enter/exit.
5. Export a `useSnackbar()` hook that reads the context.

```tsx
// Usage:
const { enqueueSnackbar } = useSnackbar();
enqueueSnackbar('Video uploaded!', { variant: 'success' });
```

Key decisions:
- Max visible snackbars (e.g., 3), queue the rest.
- Animation: CSS `transform: translateX(120%)` -> `translateX(0)` on enter, reverse on exit.
- Use `ReactDOM.createPortal` to render outside the component tree.

---

### 1.2 `ArtDialog.tsx` -- Build Custom Dialog with Provider

**TODO**: "Make ArtDialog with Provider. Find real example that can be used as documentation of how to make dialog. Somewhat similar to Notistack's abilities."

**How to implement:**

Similar to the snackbar pattern -- context-driven, imperative API:

```tsx
// Provider API:
const { openDialog, closeDialog } = useDialog();

// Usage:
const confirmed = await openDialog({
  title: 'Delete video?',
  content: 'This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
});
if (confirmed) { /* delete */ }
```

Steps:
1. `ArtDialogProvider` manages state: `{ open, title, content, onConfirm, onCancel }`.
2. `openDialog()` returns a `Promise<boolean>` that resolves when the user clicks confirm/cancel.
3. The dialog component renders a backdrop + centered modal (like `GenrePopover` but generalized).
4. Focus trap: when open, Tab key stays inside the dialog.
5. Close on Escape key and backdrop click.

This replaces the manual `open`/`onClose` prop pattern used in `GenrePopover`.

---

### 1.3 `ArtDebounceInput.tsx` -- Full Renovate

**TODO**: "Full renovate. Doesn't work as expected. Also to make things more reusable, move debounce logic to a separate file and just use it in ArtInput as prop."

**How to implement:**

Step 1 -- Extract a `useDebounce` hook:

```ts
// hooks/useDebounce.ts
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debounced = useMemo(
    () => debounce((...args: any[]) => callbackRef.current(...args), delay),
    [delay]
  );

  useEffect(() => () => debounced.cancel(), [debounced]);
  return debounced as unknown as T;
}
```

Step 2 -- Add `debounceMs` and `onDebouncedChange` as optional props directly to `ArtInput`:

```tsx
// In ArtInput.tsx
const ArtInput = forwardRef<HTMLInputElement, ArtInputProps>((props, ref) => {
  const { debounceMs, onDebouncedChange, onChange, ...rest } = props;

  const debouncedFn = useDebouncedCallback((value: string) => {
    onDebouncedChange?.(value);
  }, debounceMs ?? 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (onDebouncedChange) debouncedFn(e.target.value);
  };
  // ... rest of ArtInput
});
```

Step 3 -- Remove `ArtDebounceInput.tsx` entirely. `ArtComboBox` now just uses `ArtInput` with `debounceMs`.

---

### 1.4 `ArtComboBox.tsx` -- Update Based on Other Component Updates

**TODO**: "Update based on other components updates."

Once `ArtDebounceInput` is merged into `ArtInput`, simplify `ArtComboBox`:
- Remove the `useDebounce` vs non-debounce branching (lines 46-56, 114-138).
- Always render `<ArtInput>` with optional `debounceMs` prop.
- The `ArtComboBox` becomes purely about dropdown behavior, not input variant selection.

---

### 1.5 `ArtIcon.tsx` -- Add Tooltip to Label Prop

**TODO**: "Make it tooltip"

**How to implement:**

Option A -- CSS-only tooltip (simplest, no dependencies):

```tsx
const ArtIcon: React.FC<ArtIconProps> = ({ name, size, label, ...rest }) => {
  const Icon = Icons[name];
  if (!Icon) return null;

  return (
    <span
      className="art-icon-wrapper"
      data-tooltip={label}
      aria-label={label}
    >
      <Icon width={size} height={size} {...rest} />
    </span>
  );
};
```

```css
/* globals.css */
.art-icon-wrapper {
  position: relative;
  display: inline-flex;
}
.art-icon-wrapper[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
}
```

Option B -- Reusable `ArtTooltip` wrapper component (better for reuse across the app, not just icons).

---

### 1.6 `app/page.tsx` -- Import from Homepage

**TODO**: "Import from page/homepage/Homepage.tsx"

The file currently just has the TODO comment. Implementation:

```tsx
// app/page.tsx
import Homepage from '@/page/homepage/Homepage';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ freeText?: string }>;
}) {
  const params = await searchParams;
  return <Homepage searchParams={params} />;
}
```

---

### 1.7 `app/upload/loading.tsx` -- Build Upload Page Skeleton

**TODO**: (empty)

Build a skeleton matching the upload form layout:

```tsx
export default function Loading() {
  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="shimmer" style={{ height: 28, width: '40%', marginBottom: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="shimmer" style={{ height: 40, width: '100%' }} />
        <div className="shimmer" style={{ height: 80, width: '100%' }} />
        <div className="shimmer" style={{ height: 40, width: '100%' }} />
        <div className="shimmer" style={{ height: 40, width: '50%' }} />
        <div className="shimmer" style={{ height: 40, width: '100%' }} />
      </div>
    </div>
  );
}
```

---

## 2. Bugs & Issues Found

### 2.1 `comment.hooks.ts:24` -- Hardcoded Broken URL

`useCommentById` has a hardcoded placeholder URL:
```ts
const res = await axios.get<CommentModel>(`some/random/path/doesNotExist/${commentId}`);
```

Fix: use `API.comment.byId(commentId)` (you'd need to add this to `apiUrl.ts`), or remove the hook entirely since the comment at line 42 of `comment.service.ts` says "NOTE: Not in use".

---

### 2.2 `video.hooks.ts` -- Inconsistent Axios Import

`video.hooks.ts` imports plain `axios` (`import axios from 'axios'`), while `comment.hooks.ts` imports the custom client (`import axios from '@/lib/axiosClient'`). The custom client normalizes errors to `ApiError`. All hooks should use `@/lib/axiosClient` for consistent error handling.

---

### 2.3 `genre.hooks.ts` -- Same Inconsistent Import

`genre.hooks.ts` also imports plain `axios` instead of `@/lib/axiosClient`.

---

### 2.4 `video/[id]/page.tsx:10-13` -- Direct Prisma in Page Component

The video page calls `prisma.video.findUnique` and `prisma.comment.findMany` directly instead of using the service layer. The inline comment says "Create Hook and USE IT". This bypasses the server cache (`cached()`), meaning every page load hits the database.

Fix: call the service functions or use `cached()` directly:

```ts
const video = await cached(
  () => prisma.video.findUnique({ where: { id }, include: { genres: true } }),
  CACHE_KEYS.video.byId(id)
);
```

---

### 2.5 `video.service.ts` -- `include` and `select` Used Together

In `getPagedVideos()`, both `include: { genres: true }` and `select: { id, title, ... }` are passed to `prisma.video.findMany()`. Prisma ignores `include` when `select` is present -- genres are never actually included in the response.

Fix: either use `select` with nested `genres: { select: { id: true, name: true } }`, or drop `select` and use `include` only.

---

### 2.6 `page/video/components/RelatedVideos.tsx` -- Duplicate of `SimilarVideos.tsx`

`RelatedVideos.tsx` and `SimilarVideos.tsx` are identical components (same code, different file names). One should be deleted.

---

## 3. Suggested Improvements

### 3.1 Add Error Display to Mutations

`useCreateComment` and `useCreateVideo` don't have `onError` handlers. If a mutation fails, the user sees nothing. Once `ArtSnackbar` is built:

```ts
const createComment = useCreateComment(videoId);
// In handleComment:
createComment.mutate(text, {
  onSuccess: (c) => { /* existing logic */ },
  onError: (err) => enqueueSnackbar(err.message, { variant: 'error' }),
});
```

---

### 3.2 Add Loading/Disabled States to Buttons

The "Send" button in `CommentSection.tsx` and several buttons in `UploadForm.tsx` don't show loading state during mutations. Add:

```tsx
<button onClick={handleComment} disabled={createComment.isPending}>
  {createComment.isPending ? 'Sending...' : 'Send'}
</button>
```

---

### 3.3 Centralize Inline Styles into CSS

`CommentSection.tsx`, `VideoPlayer.tsx`, `VideoGrid.tsx`, and `video/[id]/page.tsx` all define styles inline or via `<style>` JSX tags. For the graduation work, consider moving repeated patterns (`.video-page`, `.video-grid`, `.video-sidebar`) into `globals.css` under `@layer components`. This:
- Eliminates duplicate `<style>` blocks between `page.tsx` and `loading.tsx`
- Makes the styling approach consistent (everything in one place)
- Is more presentable in documentation

---

### 3.4 Type Safety for API Responses

Some components use `any` types for API responses:

- `VideoGrid.tsx:16`: `data?.pages.flatMap((p: any) => p.data)`
- `VideoGrid.tsx:55`: `videos.map((video: any) => ...)`

These should be typed with the model types (`PaginatedResponse<VideoLightModel>`, `VideoLightModel`).

---

### 3.5 Extract Video Duration Formatting

`VideoPlayer.tsx` has a `fmt()` function for formatting seconds to `H:MM:SS`. This could be useful elsewhere (e.g., showing video duration on `VideoCard`). Move to a shared utility:

```ts
// lib/formatTime.ts
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
```

---

### 3.6 Add Keyboard Accessibility to ArtComboBox

`ArtComboBox` handles keyboard navigation (Arrow keys, Enter, Escape) but is missing:
- `role="combobox"` and `aria-expanded` on the input
- `role="listbox"` on the dropdown `<ul>`
- `role="option"` and `aria-selected` on each `<li>`
- `aria-activedescendant` pointing to the active option

These ARIA attributes are important for screen readers and are a good demonstration of accessibility knowledge in a graduation project.

---

### 3.7 Add `onDelete` to Comments

The comment system supports creating but not deleting comments. To complete the CRUD cycle:

1. Add `DELETE /api/video/:id/comments/:commentId` route
2. Add `deleteComment` to `comment.service.ts`
3. Add `useDeleteComment` hook
4. Add a delete button (trash icon) to each comment in `CommentSection`

---

### 3.8 Consider a `useDebounce` Value Hook

In addition to the `useDebouncedCallback` hook (see TODO 1.3), a `useDebouncedValue` hook is useful for search scenarios:

```ts
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

This simplifies `SearchField.tsx` -- no need for `debouncedQuery` state + `handleDebouncedChange` callback. Just:

```tsx
const [query, setQuery] = useState(initialQuery);
const debouncedQuery = useDebouncedValue(query, 300);
const { data: suggestions } = useSearchField(debouncedQuery);
```

---

### 3.9 Add `displayName` to Page Components

All Art components have `Component.displayName = 'ComponentName'` set, which helps React DevTools. Page components like `Homepage`, `VideoGrid`, etc. are named via `export default function ComponentName` which works, but adding `displayName` explicitly to `forwardRef` components is a good consistent practice to document in the graduation work.

---

## Summary

| Priority | Item | Type |
| -------- | ---- | ---- |
| High | 2.4 Direct Prisma in page (bypasses cache) | Bug |
| High | 2.5 `include` + `select` conflict | Bug |
| High | 1.6 Wire up `app/page.tsx` | TODO |
| Medium | 2.1 Broken URL in `useCommentById` | Bug |
| Medium | 2.2-2.3 Inconsistent axios import | Bug |
| Medium | 2.6 Duplicate RelatedVideos/SimilarVideos | Cleanup |
| Medium | 1.3 Renovate ArtDebounceInput | TODO |
| Medium | 1.4 Update ArtComboBox | TODO |
| Medium | 3.4 Remove `any` types | Improvement |
| Low | 1.1 Build ArtSnackbar | TODO |
| Low | 1.2 Build ArtDialog | TODO |
| Low | 1.5 ArtIcon tooltip | TODO |
| Low | 1.7 Upload loading skeleton | TODO |
| Low | 3.1-3.2 Error display + loading states | Improvement |
| Low | 3.3 Centralize inline styles | Improvement |
| Low | 3.5-3.9 Various small improvements | Improvement |
