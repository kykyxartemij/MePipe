# Art Component Suggestions

Components that would let feature code rely fully on the Art library instead of raw HTML.

---

## 1. ArtDialog (already TODO in `ArtDialog.tsx`)

**Where it's needed:** `GenrePopover.tsx` — currently uses a raw `<div>` overlay with `fixed inset-0 bg-black/50` and manual `onClick` close handling.

**What it should cover:**
- Backdrop overlay with click-outside-to-close
- Focus trapping
- Escape key to close
- Transition animations (fade in/out)
- Provider-based API (similar to Notistack) so any component can open a dialog without prop drilling

---

## 2. ArtCheckbox

**Where it's needed:** `GenrePopover.tsx` — uses raw `<input type="checkbox">` with no styling.

**What it should cover:**
- Custom styled checkbox matching the Art design system (dark surface, accent colors)
- `color?: ArtColor` prop for tinting
- `label` prop for the label text (instead of wrapping in a `<label>` manually)
- Controlled + uncontrolled modes

---

## 3. ArtBadge / ArtChip

**Where it's needed:** `VideoPage.tsx` — genre tags are raw `<span>` elements with inline Tailwind:
```tsx
<span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted">{g.name}</span>
```

**What it should cover:**
- Small pill/badge component for tags, categories, status labels
- `color?: ArtColor` prop
- Optional `icon` prop (left-aligned small icon)
- Optional `onRemove` callback (renders a small X button for removable chips)
