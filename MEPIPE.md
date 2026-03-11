# MePipe

YouTube clone -- fullstack pet project built with Next.js, React, Prisma, and PostgreSQL.

## Stack

| Layer        | Technology                                |
| ------------ | ----------------------------------------- |
| Frontend     | Next.js 15 (App Router), React 19, TypeScript |
| Backend      | Next.js API Routes (Route Handlers)       |
| ORM          | Prisma 7 + Accelerate (connection pooling)|
| Database     | PostgreSQL (via Prisma Postgres)           |
| Styling      | Tailwind CSS 4 + CSS custom properties    |
| Validation   | Yup 1.7 (runtime) + TypeScript (compile-time) |
| Data Fetching| React Query 5 (client) + unstable_cache (server) |
| Forms        | React Hook Form 7 + @hookform/resolvers   |

## Project Structure

```
src/
  app/                        # Next.js App Router
    layout.tsx                 #   Root layout (QueryProvider, Navbar)
    page.tsx                   #   Homepage entry
    Navbar.tsx                 #   Global navigation bar
    upload/
      page.tsx                 #   Upload page entry
      loading.tsx              #   Upload page skeleton
    video/
      [id]/page.tsx            #   Video page (SSR)
      [id]/loading.tsx         #   Video page skeleton
    api/                       # API Route Handlers
      genre/route.ts           #   GET /api/genre, POST /api/genre
      video/route.ts           #   GET /api/video, POST /api/video
      video/[id]/route.ts      #   GET /api/video/:id
      video/[id]/comments/route.ts  # GET, POST /api/video/:id/comments
      video/[id]/similar/route.ts   # GET /api/video/:id/similar
      video/search/route.ts    #   GET /api/video/search

  page/                        # Page-level components (co-located by feature)
    homepage/
      Homepage.tsx             #   Homepage wrapper
      VideoGrid.tsx            #   Infinite-scroll video grid
      SearchField.tsx          #   Search with autocomplete
    video/
      VideoCard.tsx            #   Video card + skeleton
      components/
        VideoPlayer.tsx        #   Custom HTML5 video player
        CommentSection.tsx     #   Comments list + form
        SimilarVideos.tsx      #   Related videos sidebar
    upload/
      components/
        UploadForm.tsx         #   Video upload form
        GenrePopover.tsx       #   Genre multi-select modal

  components/                  # Reusable UI components ("Art" component library)
    ui/
      ArtInput.tsx             #   Input with icon, clear button, helper text
      ArtTextarea.tsx          #   Textarea with helper text
      ArtDebounceInput.tsx     #   Input with debounced onChange
      ArtComboBox.tsx          #   Combobox (input + dropdown list)
      ArtIcon.tsx              #   Icon wrapper that maps name -> SVG
      ArtSnackbar.tsx          #   (Planned) Custom snackbar
      ArtDialog.tsx            #   (Planned) Custom dialog
    icons/                     #   SVG icon components
      index.ts                 #   Barrel export for all icons

  hooks/                       # React Query hooks (one file per domain)
    video.hooks.ts             #   usePagedVideos, useById, useSimilarVideos, useSearchField, useCreateVideo
    comment.hooks.ts           #   usePagedCommentsByVideoId, useCreateComment
    genre.hooks.ts             #   useGenres, useCreateGenre

  services/                    # Server-side business logic (one file per domain)
    video.service.ts           #   getPagedVideos, getVideoById, getSimilarVideos, getSearchSuggestions, createVideo
    comment.service.ts         #   getPagedCommentsByVideoId, createComment
    genre.service.ts           #   getGenres, createGenre

  models/                      # Types + Yup validation schemas
    index.ts                   #   IdValidator, parseIdFromRoute (shared)
    video.models.ts            #   VideoModel, VideoLightModel, VideoWriteModel, VideoCreateValidator
    comment.models.ts          #   CommentModel, CommentCreateValidator
    genre.models.ts            #   GenreModel, GenreCreateValidator
    api-error.ts               #   ApiError class (client + server)
    paginated-response.model.ts #  PaginatedResponse<T>, pagination validator + helpers

  lib/                         # Infrastructure utilities
    prisma.ts                  #   Prisma client singleton (with Accelerate)
    serverCache.ts             #   cached() and invalidateCache() wrappers
    cacheKeys.ts               #   Server-side cache key factories
    queryKeys.ts               #   Client-side React Query key factories
    apiUrl.ts                  #   API URL builders (one per endpoint)
    axiosClient.ts             #   Axios instance with ApiError interceptor
    errorHandler.ts            #   handleApiError() -- maps errors to HTTP responses
    freeText.ts                #   normalizeText() utility

  providers/
    QueryProvider.tsx          #   React Query client + devtools

  styles/
    globals.css                #   Tailwind directives, CSS variables, component classes

prisma/
  schema.prisma                # Database schema
  seed.ts                      # Database seeder
```

## Architecture

### Data Flow Overview

```
Browser (React)                     Server (Next.js)                  Database (PostgreSQL)
    |                                     |                                  |
    |--- React Query hook ------>         |                                  |
    |    (video.hooks.ts)                 |                                  |
    |                                     |                                  |
    |--- axios GET /api/video ----------> |                                  |
    |    (apiUrl.ts builds URL)           |                                  |
    |                                     |--- route.ts delegates -------->  |
    |                                     |    to video.service.ts           |
    |                                     |                                  |
    |                                     |--- cached() wraps query ------>  |
    |                                     |    (serverCache.ts)              |
    |                                     |                                  |
    |                                     |    prisma.video.findMany() ---> |
    |                                     |                                  |
    |                                     | <--- PaginatedResponse -------- |
    |                                     |                                  |
    | <--- JSON response ---------------- |                                  |
    |                                     |                                  |
    |--- React Query caches result        |                                  |
    |    (queryKeys.ts)                   |                                  |
```

### Layer Responsibilities

**Route Handlers** (`app/api/**/route.ts`) -- Thin routing layer. Each file exports HTTP method functions (`GET`, `POST`) that delegate to the corresponding service function. No business logic here.

**Services** (`services/*.service.ts`) -- All server-side business logic lives here. Each function:
1. Validates input (Yup schemas from `models/`)
2. Queries the database via Prisma (wrapped in `cached()`)
3. Returns a `NextResponse`
4. Catches errors via `handleApiError()`

**Hooks** (`hooks/*.hooks.ts`) -- Client-side data layer. Each hook wraps a React Query `useQuery`/`useMutation`/`useInfiniteQuery` call. Hooks:
- Use `queryKeys.ts` for cache key consistency
- Use `apiUrl.ts` for URL building
- Type responses with models from `models/`
- Handle optimistic cache updates on mutations

**Models** (`models/`) -- Shared between client and server. Each model file contains:
- **BE Model**: interface extending Prisma's generated type
- **FE Model**: interface representing what the client receives
- **Validator**: Yup schema for runtime validation
- **Inferred Type**: `yup.InferType<typeof Validator>` for type safety

### Art Component Library

Custom reusable UI components prefixed with `Art`. All components:
- Use `forwardRef` for ref forwarding (compatible with React Hook Form)
- Accept standard HTML attributes via `extends React.InputHTMLAttributes`
- Use CSS classes defined in `globals.css` (under `@layer components`)
- Support `helperText` for validation error display

| Component         | Purpose                          | Key Props                              |
| ----------------- | -------------------------------- | -------------------------------------- |
| `ArtInput`        | Text input                       | `icon`, `clearable`, `helperText`      |
| `ArtTextarea`     | Multiline text input             | `helperText`                           |
| `ArtDebounceInput`| Input with debounced callback    | `debounceMs`, `onDebouncedChange`      |
| `ArtComboBox`     | Input + dropdown suggestions     | `options`, `onSubmit`, `debounce`, `noOptionsMessage` |
| `ArtIcon`         | SVG icon by name                 | `name` (type-safe), `size`             |

### How ArtInput Works (Example)

```tsx
// ArtInput uses forwardRef so React Hook Form's register() can attach a ref
const ArtInput = forwardRef<HTMLInputElement, ArtInputProps>((props, ref) => {
  const { icon, clearable, helperText, onChange, ...rest } = props;

  // Merge forwarded ref with internal ref (needed for clear button)
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setRef = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    typeof ref === 'function' ? ref(el) : (ref.current = el);
  };

  // Clear button programmatically sets value and dispatches events
  // so React Hook Form detects the change
  const handleClear = () => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;
    setter?.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <div className="art-input-wrapper">
      <div className="art-input-inner">
        {icon && <span className="art-input-icon"><ArtIcon {...icon} /></span>}
        <input ref={setRef} className="art-input" onChange={handleChange} {...rest} />
        {clearable && hasValue && (
          <button className="art-input-clear" onClick={handleClear}>
            <ArtIcon name="Close" size={14} />
          </button>
        )}
      </div>
      {helperText && <p className="art-field-helper">{helperText}</p>}
    </div>
  );
});
```

Key techniques:
- **Dual ref**: merging `forwardRef` + internal `useRef` so clear logic works alongside form libraries
- **Native setter**: using `Object.getOwnPropertyDescriptor` to programmatically set value and trigger React's synthetic events
- **CSS structure**: wrapper -> inner (relative) -> icon (absolute) + input + clear button (absolute)

## Database Schema

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
  id              String    @id @default(uuid())
  title           String
  description     String    @default("")
  thumbnailUrl    String
  videoUrl        String
  durationSeconds Int
  publishedAt     DateTime  @default(now())
  ageRating       AgeRating @default(G_0)
  genres          Genre[]       // implicit many-to-many
  comments        Comment[]     // one-to-many
}

model Comment {
  id        String   @id @default(uuid())
  text      String
  createdAt DateTime @default(now())
  videoId   String
  video     Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
}

enum AgeRating {
  G_0
  G_12
  G_16
  G_18
}
```

**Key decisions:**
- **Implicit many-to-many** (`Genre <-> Video`): Prisma auto-creates a join table. No manual join model needed.
- **Cascade delete**: deleting a Video deletes all its Comments.
- **UUIDs** for all IDs: globally unique, no sequential leaking.
- **Generated client** output to `generated/prisma/` (gitignored).

## Model Layer Pattern

Each domain has a model file that serves both client and server. The pattern:

```ts
// 1. BE Model -- extends Prisma's generated type (used in services)
export interface VideoPrismaModel extends PrismaVideo {}

// 2. FE Model -- what the client receives from the API
export interface VideoModel {
  id: string;
  title: string;
  // ... only the fields the frontend needs
}

// 3. Light Model -- minimal fields for lists/cards
export interface VideoLightModel {
  id: string;
  title: string;
  thumbnailUrl: string;
}

// 4. Write Model -- what the client sends to create/update
export interface VideoWriteModel {
  title: string;
  videoFile: File;
  // ...
}

// 5. Validator -- Yup schema for runtime validation
export const VideoCreateValidator = yup.object({
  title: yup.string().required().min(1).max(200),
  // ...
});

// 6. Inferred Type -- auto-generated from the Yup schema
export type VideoCreateRequest = yup.InferType<typeof VideoCreateValidator>;
```

**Why separate FE and BE models?**
- The database model may have fields the client should never see.
- The frontend model may include computed fields (e.g., `totalComments` from `_count`).
- Light models reduce payload size for list views.

## Validation Strategy

Yup validates on **both** sides:

| Where         | What                     | How                                         |
| ------------- | ------------------------ | ------------------------------------------- |
| API routes    | Route params (`:id`)     | `IdValidator.validateSync(params)`          |
| API routes    | Request body             | `CommentCreateValidator.validate(body)`     |
| API routes    | Query params (pagination)| `PaginatedResponseValidator.validate(data)` |
| Client forms  | Form fields              | `yupResolver(schema)` with React Hook Form  |

The `handleApiError()` function in `errorHandler.ts` catches Yup `ValidationError` and returns structured 400 responses with per-field errors.

## Caching Architecture

MePipe uses **two caching layers** that work together:

### Server-Side: `unstable_cache` (Next.js)

The `cached()` wrapper in `serverCache.ts`:

```ts
export async function cached<T>(
  queryFn: () => Promise<T>,
  cacheKey: string[],
  ttl: number = 90,
  tags?: string[]
): Promise<T> {
  const cachedFn = unstable_cache(async () => queryFn(), cacheKey, {
    revalidate: ttl,
    tags: tags ?? cacheKey,
  });
  return cachedFn();
}
```

- Wraps any async function with Next.js server cache.
- Shared across all users and serverless instances (not per-browser).
- `invalidateCache()` uses `revalidateTag()` for targeted invalidation after mutations.
- Cache keys are centralized in `cacheKeys.ts` to prevent key drift.

### Client-Side: React Query

- `QueryProvider` configures a global `QueryClient` with 15s `staleTime`.
- Each hook uses keys from `queryKeys.ts` (structured as `[resource, kind, subtype, ...args]`).
- Mutations invalidate list queries and optimistically set single-item cache.

### Why Two Layers?

| Concern            | Server Cache (unstable_cache) | Client Cache (React Query) |
| ------------------ | ----------------------------- | -------------------------- |
| Scope              | All users, all instances      | Single browser tab         |
| Reduces DB queries | Yes                           | No (reduces HTTP requests) |
| Invalidation       | Tag-based (`revalidateTag`)   | Key-based (`invalidateQueries`) |
| Cost               | Free (built into Next.js)     | Free (client library)      |

## Error Handling

### Server Side (`errorHandler.ts`)

`handleApiError()` is a centralized error mapper. It handles:

1. **`ApiError`** (custom) -- returns structured `{ error, code, details }` with the correct status.
2. **Axios errors** -- when the server proxies requests. Extracts status, message, details.
3. **Yup `ValidationError`** -- maps `inner` array to per-field errors, returns 400.
4. **Prisma `PrismaClientKnownRequestError`** -- maps error codes to HTTP statuses:
   - `P2025` (not found) -> 404
   - `P2002` (unique constraint) -> 409
   - `P2003` (foreign key) -> 404
5. **Everything else** -> 500 `Internal server error`.

### Client Side (`ApiError` class)

`ApiError.fromAxios(err)` normalizes Axios errors into a consistent shape:

```ts
class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  static fromAxios(err: AxiosError) {
    // Extracts message, status, code, details from response
  }
}
```

The `axiosClient.ts` interceptor automatically converts all Axios errors to `ApiError` instances.

## API Endpoints

| Method | Endpoint                        | Description              | Pagination | Cache |
| ------ | ------------------------------- | ------------------------ | ---------- | ----- |
| GET    | `/api/video`                    | List videos (filterable) | Yes        | Yes   |
| POST   | `/api/video`                    | Upload new video         | --         | Invalidates |
| GET    | `/api/video/:id`                | Get video by ID          | --         | Yes   |
| GET    | `/api/video/:id/similar`        | Similar videos by genre  | Yes        | Yes   |
| GET    | `/api/video/:id/comments`       | Comments for a video     | Yes        | Yes   |
| POST   | `/api/video/:id/comments`       | Add a comment            | --         | Invalidates |
| GET    | `/api/video/search`             | Autocomplete suggestions | --         | Yes   |
| GET    | `/api/genre`                    | List all genres          | --         | Yes   |
| POST   | `/api/genre`                    | Create a genre           | --         | Invalidates |

**Pagination**: all paginated endpoints accept `?page=1&pageSize=10` and return `PaginatedResponse<T>`:
```ts
{ data: T[], total: number, page: number, pageSize: number }
```

**Why no `total` count?** Intentional design -- a separate `COUNT(*)` query doubles the database operations per request. On Prisma Postgres (free tier: 100k ops/month), every query counts. Instead, the client uses `data.length < pageSize` to detect the last page (infinite scroll pattern). Prisma relations with `_count` handle counts where needed (e.g., `totalComments` on a single video) without a separate round-trip.

## Key Libraries

### React Query (TanStack Query v5)

Used for all client-side data fetching. Patterns in use:
- `useQuery` -- single resource fetching (video by ID, genres list)
- `useInfiniteQuery` -- infinite scroll (video grid)
- `useMutation` -- create operations with cache invalidation
- `useQueryClient` -- manual cache manipulation on mutation success

### Yup

Runtime validation library. Used for:
- API request body validation (server)
- Route parameter validation (server)
- Form field validation (client, via `@hookform/resolvers`)
- Type inference (`yup.InferType<typeof Schema>`)

### Prisma + Prisma Postgres + Accelerate

- **Prisma ORM**: type-safe database queries, schema-driven development.
- **Prisma Postgres**: hosted PostgreSQL with built-in connection pooling.
- **Prisma Accelerate**: connection pooling extension for serverless environments (prevents connection exhaustion).
- **Singleton pattern** in `prisma.ts`: reuses the client across hot reloads in development.

### React Hook Form

Used in `UploadForm.tsx` for form state management:
- `useForm` with `yupResolver` for Yup-based validation
- `register()` attaches to Art components via `forwardRef`
- `formState.errors` passed as `helperText` to Art components

## Styling Approach

- **CSS custom properties** (`--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--primary`) define the dark theme.
- **Tailwind CSS 4** used for utility classes.
- **`@layer components`** in `globals.css` defines Art component classes (`.art-input`, `.btn`, `.navbar`, etc.).
- **`@layer utilities`** defines custom utilities (`.shimmer` skeleton animation).
- **Inline styles** used in page-level components for layout (grid, flex) that is page-specific.

## Prisma Client Setup

```ts
// lib/prisma.ts
import { PrismaClient } from '../../generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

function makePrisma() {
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
  }).$extends(withAccelerate());
}

// Singleton: reuse across hot reloads in dev
const globalForPrisma = globalThis as unknown as { prisma: ExtendedPrisma };
export const prisma = globalForPrisma.prisma || makePrisma();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Why singleton?** In development, Next.js hot-reloads modules. Without the global cache, each reload creates a new `PrismaClient`, exhausting database connections.

## Query Key Strategy

Both `queryKeys.ts` (client) and `cacheKeys.ts` (server) follow a structured factory pattern:

```ts
// Client (React Query)
export const queryKeys = {
  video: {
    invalidate: {
      all:    () => ["video"],           // invalidate everything video-related
      list:   () => ["video", "list"],   // invalidate only lists
      single: () => ["video", "single"], // invalidate only singles
    },
    paged: (page, pageSize, freeText?) =>
      ["video", "list", "paged", { freeText, page, pageSize }],
    byId: (id) => ["video", "single", "byId", id],
  },
};
```

**Format**: `[resource, kind, subtype, ...args]`
- `resource` -- top-level invalidation target
- `kind` -- `"list"` or `"single"` for granular invalidation
- `subtype` -- identifies the cache shape
- `args` -- query-specific parameters

## Development Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Sync database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev           # -> localhost:3000

# Other commands
npm run db:studio     # Prisma Studio (visual DB editor)
npm run lint          # ESLint
npm run format        # Prettier
```

## Deployment

### Free Tier

- **Database**: Prisma Postgres (100k ops/month, 1GB storage)
- **Hosting**: Vercel Hobby (free)
- **Connection**: Prisma Accelerate (connection pooling)

### Production

- **Database**: Prisma Postgres (1M+ ops/month)
- **Hosting**: Vercel Pro ($20/mo)
- **Connection**: Prisma Accelerate (connection pooling)
