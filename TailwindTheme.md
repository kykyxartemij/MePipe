# Tailwind & Theme Management

## How Tailwind works in this project

This project uses **Tailwind v4**, which is CSS-variable-first and no longer requires a `tailwind.config.js`.

- Tailwind utilities are imported via `@import "tailwindcss"` at the top of `globals.css`.
- Custom design tokens live in `globals.css` as CSS custom properties — Tailwind does **not** define colors or spacing for us.
- Use Tailwind for layout, spacing, and typography utilities (`flex`, `gap-4`, `text-sm`, `font-bold`, etc.).
- Use CSS variables (`var(--surface)`, `var(--text-muted)`) for all colors. Do **not** use Tailwind color utilities like `bg-gray-800` — those would bypass the theme system.

### Tailwind v4 syntax notes

```css
/* v4 canonical form — no `[var(...)]` wrapper needed */
border-(--border)       /* instead of border-[var(--border)] */
text-(--text-muted)     /* instead of text-[var(--text-muted)] */
```

---

## Design token layer (`globals.css`)

All colors are defined as CSS custom properties on `:root` (dark theme, the default).

```css
:root {
  --bg:         #0f0f0f;   /* page background */
  --surface:    #1a1a1a;   /* cards, inputs, dropdowns */
  --border:     #333;      /* all borders */
  --text:       #f1f1f1;   /* primary text */
  --text-muted: #aaa;      /* labels, placeholders, secondary text */

  --art-primary: #646cff;
  --art-warning: oklch(75% 0.18 85);
  --art-success: oklch(68% 0.19 145);
  --art-danger:  oklch(62% 0.22 25);

  --art-accent:      var(--art-primary);   /* active color — overridden by .art-{color} */
  --art-field-focus: var(--text-muted);    /* input focus border — overridden inside colored wrappers */
}
```

### Why this scales to 100+ components

Components **never own colors** — they reference tokens. Adding a new component means writing `var(--surface)`, `var(--border)`, `var(--text-muted)`. When the theme changes, all components update for free. You redefine only 5–6 tokens per theme, not per component.

---

## Theme system

Themes are CSS classes applied to `<html>`. The default (no class) is dark.

| Class             | Description                                          |
|-------------------|------------------------------------------------------|
| *(none)*          | Dark theme (default)                                 |
| `.theme-light`    | Light theme                                          |
| `.theme-contrast` | High Contrast (EN 301 549 / WCAG 2.1 AA palette)    |

### Switching themes in Next.js

```tsx
// Apply theme class to <html> — e.g. from a theme toggle button
document.documentElement.classList.remove('theme-light', 'theme-contrast');
document.documentElement.classList.add('theme-light');  // or 'theme-contrast'
```

Or in `layout.tsx` for a static theme:

```tsx
<html lang="en" className="theme-light">
```

### Defined tokens per theme

```css
/* Light */
.theme-light {
  color-scheme: light;
  --bg: #f5f5f5;  --surface: #ffffff;
  --border: #e0e0e0;  --text: #111111;  --text-muted: #666666;
  --art-primary: #4f46e5;
  /* warning/success/danger also adjusted for light-bg contrast */
}

/* High Contrast — Windows HC Black palette (WCAG AA, all pairs ≥ 4.5:1) */
.theme-contrast {
  color-scheme: dark;
  --bg: #000000;  --surface: #000000;   /* no surface layers in HC */
  --border: #ffffff;  --text: #ffffff;  --text-muted: #aaaaaa; /* 4.52:1 on black */
  --art-primary: #1aebff;   /* Windows HC highlight */
  --art-warning: #ffff00;   /* Windows HC hyperlink yellow */
  --art-success: #00ff00;   /* Windows HC success green */
  --art-danger:  #ff6060;
}
```

### `--art-accent` and `--art-field-focus` are derived automatically

Both are declared as `var(--art-primary)` and `var(--text-muted)` in `:root`. Since CSS variables resolve lazily, overriding `--art-primary` in `.theme-light` automatically cascades to `--art-accent` and `--art-field-focus` everywhere. No need to redefine them per theme.

---

## Color modifier classes

Wrap any element (or apply directly to a component) to tint it:

```tsx
<div className="art-primary">   {/* --art-accent → primary blue */}
<div className="art-warning">   {/* --art-accent → warning yellow */}
<div className="art-success">   {/* --art-accent → success green */}
<div className="art-danger">    {/* --art-accent → danger red */}
```

Art components read `var(--art-accent)` for borders, icon tints, focus rings inside colored field wrappers, etc.

---

## Reverse modifier

Flip the theme for a sub-section without switching the whole page:

```tsx
<div className="art-reverse p-4 rounded-lg">
  {/* Dark page → this section shows light tokens, and vice versa */}
  <ArtInput label="Name" />
</div>
```

- Dark context + `.art-reverse` → light tokens
- Light context + `.art-reverse` → dark tokens
- High Contrast + `.art-reverse` → **no effect** (contrast must never be inverted)

---

## Rule: no hardcoded colors in components

```tsx
// ✅ Correct
<div style={{ color: 'var(--text-muted)' }}>...</div>
<div className="border-(--border)">...</div>

// ❌ Wrong — bypasses theme system
<div style={{ color: '#aaa' }}>...</div>
<div className="border-gray-700">...</div>
```

---

## `color-scheme` and native browser controls

`color-scheme: dark` on `:root` tells the browser to render native controls (scrollbars, resize handles, date pickers) in dark-palette colors. Each theme class overrides this:

- Dark: `color-scheme: dark`
- Light: `color-scheme: light`
- High Contrast: `color-scheme: dark`

This affects scrollbar color, input caret color, and similar browser-native elements automatically.
