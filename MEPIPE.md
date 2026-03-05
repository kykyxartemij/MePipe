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

## Architecture Decisions

### Versions & Dependencies

- **Prisma**: 6.19.2 (pinned to avoid Prisma 7 breaking changes)
  - Why? Prisma 7 removes datasource URLs from schema files
  - Current setup uses `url = env("DATABASE_URL")` in schema.prisma
- **Next.js**: 15.1.0 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.8.0
- **MongoDB**: 7.x (via Docker)
- **Validation**: Yup 1.7.1 (for runtime input validation)

### Database Schema

```prisma
model Video {
  id          String   @id @default(uuid())
  title       String
  description String   @default("")
  thumbnail   String?
  videoUrl    String
  publishedAt DateTime @default(now())
  ageRating   AgeRating @default(G_0)
  genreIds    String[]
  commentIds  String[]  // Denormalized for performance
}

model Comment {
  id        String   @id @default(uuid())
  text      String
  createdAt DateTime @default(now())  // Auto-generated
}

model Genre {
  id   String @id @default(uuid())
  name String @unique
}
```

**Key Decisions:**
- **UUIDs**: All IDs use `uuid()` for global uniqueness
- **Timestamps**: `createdAt` auto-generated with `@default(now())`
- **Denormalization**: `commentIds` array in Video for efficient pagination
- **No foreign keys**: MongoDB document relationships via ID arrays

### API Design

#### Validation Strategy
- **Route Params**: Validated with Yup (e.g., video ID from URL)
- **Request Body**: Validated with Yup (e.g., comment text)
- **Response Types**: TypeScript interfaces for API contracts
- **Auto-generated Fields**: `id`, `createdAt` never validated (trusted Prisma)

#### Example: Comment Creation Flow
1. **Client**: `POST /api/videos/{id}/comments` with `{ text: "Hello" }`
2. **Validation**: 
   - URL param `id` validated as string
   - Body `text` validated as non-empty string
3. **Database**: Prisma creates `{ id: uuid(), text: "Hello", createdAt: now() }`
4. **Response**: Full comment object returned to client

### Development Setup

```bash
# Start MongoDB
docker start pipe

# Reset database and seed
npx prisma db push --force-reset
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

### Deployment Options

#### Free Tier (Current)
- **Database**: MongoDB Atlas M0 (512MB)
- **Hosting**: Vercel Hobby
- **Connection**: Direct (no Data Proxy needed for small scale)

#### Production
- **Database**: MongoDB Atlas M10+ (dedicated)
- **Hosting**: Vercel Pro
- **Connection**: Prisma Data Proxy for connection pooling
