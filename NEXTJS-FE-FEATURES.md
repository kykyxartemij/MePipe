# Next.js Frontend Features Guide

## Dynamic Imports & Lazy Loading

### What is Lazy Loading?

Lazy loading is a technique that defers loading of non-critical resources until they are needed. In React/Next.js, this means code-splitting components so they load only when required, reducing initial bundle size and improving performance.

### Next.js `dynamic()` Function

Next.js provides a built-in `dynamic()` function for lazy loading components:

```tsx
import dynamic from 'next/dynamic';

// Lazy load a component
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>, // Optional loading component
  ssr: false, // Optional: disable SSR for client-only components
});
```

### Benefits

- **Faster Initial Load**: Smaller initial JavaScript bundle
- **Better UX**: Users see content faster, heavy components load progressively
- **Reduced Bandwidth**: Only load what users actually need
- **Improved Core Web Vitals**: Better FCP (First Contentful Paint) and LCP (Largest Contentful Paint)

### When to Use Lazy Loading

**✅ Good candidates:**

- Components below the fold (not immediately visible)
- Heavy components (video players, complex forms)
- Modal/popover components (only shown on interaction)
- Sidebar content
- Admin panels or rarely-used features

**❌ Don't lazy load:**

- Main content components
- Always-visible UI (navigation, headers)
- Critical path components
- Light, frequently-used components

### Current Implementation in MePipe

**Lazy loading was implemented but removed** - not needed for current small app size.

### Performance Impact Assessment

**Current app size:** Small application with ~20 components
**Lazy loading benefit:** Minimal (saves ~10-20KB initial bundle)
**Decision:** Removed - not critical for current app size, can be added later if needed

## Loading States (`loading.tsx`)

### Purpose

`loading.tsx` files provide instant loading UI while Next.js is fetching data and rendering the page. This prevents layout shift and provides immediate feedback to users.

**Important:** `loading.tsx` cannot be imported manually - it's a special Next.js file that gets automatically used during loading states.

### How it Works

- Created in route folders (e.g., `app/video/[id]/loading.tsx`)
- Automatically shown during:
  - Initial page load
  - Navigation between routes
  - Data fetching in server components
- Replaced by actual page content when ready

### Implementation

```tsx
export default function Loading() {
  return (
    <div>
      {/* Skeleton UI that matches page layout */}
      <div className="skeleton-header" />
      <div className="skeleton-content" />
    </div>
  );
}
```

### Best Practices

- Match the actual page layout exactly
- Use skeleton/shimmer animations for better UX
- Keep it lightweight (no heavy computations)
- Test that it disappears quickly

## Page Components (`page.tsx`)

### Server Components (Default)

```tsx
export default async function Page() {
  // Server-side data fetching
  const data = await fetchData();

  return <div>{/* JSX */}</div>;
}
```

### Client Components

```tsx
'use client';

export default function Page() {
  // Client-side interactivity
  const [state, setState] = useState();

  return <div>{/* JSX */}</div>;
}
```

### Route Parameters

```tsx
// Dynamic routes: /video/[id]/page.tsx
export default async function Page({
  params, // Promise<{ id: string }>
  searchParams, // Promise<{ key: string }>
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id } = await params;
  const search = await searchParams;
  // Use id and search params
}
```

## Other Next.js Frontend Features

### 1. Image Optimization (`next/image`)

```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="Description"
  priority // For above-the-fold images
/>;
```

**Benefits:** Automatic resizing, WebP conversion, lazy loading, reduced CLS

### 2. Font Optimization

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Benefits:** Zero layout shift, automatic font loading optimization

### 3. Script Optimization

```tsx
import Script from 'next/script';

<Script
  src="https://example.com/analytics.js"
  strategy="afterInteractive" // or "lazyOnload", "beforeInteractive"
  onLoad={() => console.log('Script loaded')}
/>;
```

**Strategies:**

- `beforeInteractive`: Load before page becomes interactive
- `afterInteractive`: Load after page becomes interactive
- `lazyOnload`: Load during idle time

### 4. Metadata API

```tsx
// app/layout.tsx or page.tsx
export const metadata = {
  title: 'Page Title', // Becomes <title>Page Title</title>
  description: 'Page description', // Becomes <meta name="description" content="...">
  openGraph: {
    title: 'Open Graph Title',
    description: 'Open Graph Description',
    images: ['/og-image.jpg'],
  },
};
```

**Benefits:** SEO optimization, social media sharing, automatic meta tags

**What it does:**

- Sets the browser tab title (`<title>` tag)
- Adds meta description for search engines
- Generates Open Graph tags for social media sharing
- Creates Twitter Card meta tags
- Handles favicon and other head elements

### 5. Server Actions vs Regular Forms

**Server Actions (Next.js 14+):**

```tsx
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  // Server-side form handling without API routes
  const title = formData.get('title');
  // Process data...
}
```

**Regular Forms (useForm + yup):**

```tsx
// Client-side validation + UX
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: yupResolver(schema),
});
```

**When to use Server Actions:**

- Simple forms without complex client-side validation
- Progressive enhancement (works without JavaScript)
- Server-side processing only

**When to use regular forms:**

- Complex client-side validation (yup schemas)
- Rich UX (real-time validation, loading states)
- File uploads with progress
- Multi-step forms

**Recommendation:** Stick with `useForm + yup` for better UX and validation control.

### 6. React Server Components

- Automatic code splitting
- Server-side rendering by default
- Client components only when needed with `"use client"`

## Performance Optimization Checklist

### ✅ Done Already

- [x] Loading states with skeleton UI (`loading.tsx` files)
- [x] Server components for data fetching (default Next.js behavior)
- [x] Query caching with React Query (TanStack Query with 3min stale time)
- [x] Removed unnecessary count() operations (saves DB calls)

### ❌ Not Using (But would be nice)

- [x] Lazy loading (removed - minimal benefit for small app)
- [x] Image optimization (`next/image`) (using regular `<img>`/`<video>` tags)

### 🔄 Planning for Improvements

- [ ] Font optimization with `next/font` (if custom fonts added)
- [ ] Script optimization with `next/script` (for analytics, etc.)
- [ ] Metadata API for SEO (page titles, descriptions, Open Graph)
- [ ] Turbopack for faster development (`next dev --turbo`)
- [ ] Bundle analyzer to monitor bundle size

### 📊 Performance Monitoring

- Use Chrome DevTools Lighthouse for Core Web Vitals
- Monitor FCP (First Contentful Paint), LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift)
- Check bundle size with: `npm install --save-dev @next/bundle-analyzer`
- Run analyzer with: `npx @next/bundle-analyzer`

## Conclusion

Next.js provides excellent built-in performance features. For small applications like MePipe, focus on core functionality first. The features you've implemented (loading states, server components, query caching) provide good performance. Add advanced optimizations like lazy loading, font optimization, or metadata API only when you have real performance metrics showing they're needed.</content>
<parameter name="filePath">c:\Users\artem\GitHub\MePipe\NEXTJS-FE-FEATURES.md
