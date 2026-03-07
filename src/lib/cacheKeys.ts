// Cache keys for server-side unstable_cache
// Use these constants to ensure consistent cache keys across your app

export const CACHE_KEYS = {
  video: {
    invalidate: () => ['video'],
    paged: (page: number, pageSize: number, freeText: string) => [
      'video',
      'paged',
      String(page),
      String(pageSize),
      freeText,
    ],
    byId: (id: string) => ['video', 'byId', id],
    similar: (videoId: string, page: number, pageSize: number) => [
      'video',
      'similar',
      videoId,
      String(page),
      String(pageSize),
    ],
    search: (freeText: string) => ['video', 'search', freeText],
  },
  genre: {
    invalidate: () => ['genre'],
    all: () => ['genre', 'all'],
  },
  comment: {
    invalidate: () => ['comment'],
    paged: (videoId: string, page: number, pageSize: number) => [
      'comment',
      videoId,
      String(page),
      String(pageSize),
    ],
    byId: (id: string) => ['comment', 'byId', id],
  },
};
