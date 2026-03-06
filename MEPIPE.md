# MePipe

YouTube clone — fullstack pet project.

## Stack

- **Frontend:** Next.js 15 (React 19), TypeScript
- **Backend:** Next.js API Routes
- **ORM:** Prisma 7 + Accelerate (connection pooling)

### Local

- **DB:** PostgreSQL (via Prisma Postgres)
- **Run:** `npm run dev` → localhost:3000

### Free Deploy

- **DB:** Prisma Postgres (100k ops/month, 1GB storage)
- **Host:** Vercel (hobby, free)
- **ORM:** Prisma + Accelerate (connection pooling)

### Paid Deploy

- **DB:** Prisma Postgres (1M+ ops/month)
- **Host:** Vercel Pro ($20/mo)
- **ORM:** Prisma + Accelerate (connection pooling)

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

- **Prisma**: 7.4.2 (with Accelerate extension)
  - Why? Connection pooling for serverless environments
  - Client generated to `generated/prisma/` (gitignored)
- **Next.js**: 15.1.0 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.8.0
- **Database**: Prisma Postgres (hosted)
- **Validation**: Yup 1.7.1 (for runtime input validation)

### Database Schema

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Genre {
  id     String  @id @default(uuid())
  name   String  @unique
  videos Video[]
}

model Video {
  id          String    @id @default(uuid())
  title       String
  description String    @default("")
  thumbnail   String?
  videoUrl    String
  publishedAt DateTime  @default(now())
  ageRating   AgeRating @default(G_0)

  // Relations
  genres      Genre[]
}

model Comment {
  id        String   @id @default(uuid())
  text      String
  createdAt DateTime @default(now())

  // Relations
  videoId   String
}

enum AgeRating {
  G_0
  G_12
  G_16
  G_18
}
```

**Key Decisions:**
- **PostgreSQL**: Relational database with proper foreign keys
- **Implicit many-to-many**: `genres Video[]` + `genres Genre[]` creates join table automatically
- **UUIDs**: All IDs use `uuid()` for global uniqueness
- **Timestamps**: `createdAt` auto-generated with `@default(now())`
- **No denormalization**: Relations handled by Prisma joins

### Stack Rationale

**Why Next.js + Prisma + Prisma Postgres?**

- **Vercel + Next.js**: Vercel created Next.js, providing seamless integration for deployment and scaling
- **Next.js + React**: Full-stack React framework with excellent developer experience and performance
- **Prisma + Next.js**: Prisma ORM integrates perfectly with Next.js API routes and server components
- **Prisma + Prisma Postgres**: As Prisma's own database offering, it provides the smoothest connection possible
- **Documentation & Examples**: Extensive Prisma Postgres documentation with Next.js-specific repositories and examples for easier development

This combination represents the most cohesive full-stack ecosystem for small applications, like this one.

### API Design

#### Validation Strategy
- **Route Params**: Validated with Yup (e.g., video ID from URL)
- **Request Body**: Validated with Yup (e.g., comment text)
- **Response Types**: TypeScript interfaces for API contracts
- **Auto-generated Fields**: `id`, `createdAt` never validated (trusted Prisma)

#### Query Optimization
- **Include relations**: Single queries with `include: { genres: true }` instead of multiple round trips
- **React Query caching**: Client-side caching to reduce database operations
- **Prisma Accelerate**: Connection pooling for serverless environments

#### Example: Video with Genres Flow
1. **Client**: `GET /api/videos/{id}`
2. **Database**: Single query with `include: { genres: true }`
3. **Response**: Video object with populated genres array
4. **Cache**: React Query caches result for future requests

### Development Setup

```bash
# Sync database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Generate Prisma client (if needed)
npm run db:generate

# Start development server
npm run dev
```

### Deployment Options

#### Free Tier (Current)
- **Database**: Prisma Postgres (100k ops/month, 1GB storage)
- **Hosting**: Vercel Hobby
- **Connection**: Prisma Accelerate (connection pooling)

#### Production
- **Database**: Prisma Postgres (1M+ ops/month)
- **Hosting**: Vercel Pro ($20/mo)
- **Connection**: Prisma Accelerate (connection pooling)
