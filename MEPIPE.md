# MePipe

YouTube clone — fullstack pet project.

## Stack

- **Frontend:** Next.js 15 (React 19), TypeScript
- **Backend:** Next.js API Routes
- **ORM:** Prisma

### Local

- **DB:** MongoDB 7 (Docker, replica set)
- **Run:** `npm run dev` → localhost:3000

### Free Deploy

- **DB:** MongoDB Atlas (M0 free tier, 512 MB)
- **Host:** Vercel (hobby, free)
- **ORM:** Prisma + Data Proxy (connection pooling)

### Paid Deploy

- **DB:** MongoDB Atlas (M10+, dedicated cluster)
- **Host:** Vercel Pro ($20/mo)
- **ORM:** Prisma + Data Proxy (connection pooling)(same)

## Structure

```
src/
├── app/                    — routing (pages + API)
│   ├── layout.tsx             root layout (Navbar, <main>)
│   ├── page.tsx               "/" — home
│   ├── upload/page.tsx        "/upload"
│   ├── video/[id]/page.tsx    "/video/:id" (Server Component)
│   └── api/                   REST endpoints
│       ├── genres/route.ts
│       └── videos/...
├── components/             — reusable UI
│   ├── Navbar.tsx
│   ├── VideoCard.tsx
│   ├── VideoGrid.tsx
│   ├── UploadForm.tsx
│   ├── CommentSection.tsx
│   └── GenrePopover.tsx
├── providers/
│   └── QueryProvider.tsx   — React Query client + devtools
└── lib/
    └── prisma.ts           — Prisma Client singleton
```
