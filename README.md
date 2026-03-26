# MePipe

YouTube-style video platform built as a reference implementation for a modern full-stack Next.js architecture.

## Tech

Next.js 15 · React 19 · TypeScript · Prisma 7 · PostgreSQL (Neon) · Tailwind CSS 4 · React Query 5 · React Hook Form

## Quick start

```bash
npm install
npx prisma generate
npm run dev
```

Requires a `.env` with `DATABASE_URL` pointing to a Neon (or any Postgres) database.

## Data flow

```
PostgreSQL (Neon)
    ↑ Prisma ORM — query builder + type-safe models
services/*.service.ts — business logic, validation, server cache
    ↑ delegates from
app/api/**/route.ts — HTTP boundary (GET/POST → JSON)
    ↑ axios over HTTP
hooks/*.hooks.ts — React Query (fetch, cache, loading/error state)
    ↑ just a hook call
page/**/*.tsx — consuming the result, no idea how data arrived
```

| Layer | Owns |
|---|---|
| Prisma | How to talk to the DB, what the data looks like |
| Service | What data to fetch, business rules, caching |
| Route Handler | Translating HTTP ↔ service (thin glue) |
| React Query hook | Fetching, caching, loading/error states, invalidation |
| Page component | Consuming the result |

## Docs

Architecture, conventions, and design decisions: **[MEPIPE.md](MEPIPE.md)**
