// Centralized query keys for React Query
// Format: [resource, kind, subtype, ...args]
// Examples:
// - Video paged list: ["video","list","paged", { freeText }]
//   1: "video"  -> resource (invalidate all video queries)
//   2: "list"   -> kind (useful for invalidating/updating lists only)
//   3: "paged"  -> subtype (identifies cache shape)
//   4: props     -> additional args (e.g. freeText, page, pageSize)
// - Single comment: ["comment","single","byId", commentId]

type type = "single" | "list";

export const queryKeys = {
  video: {
    invalidate: {
      all: () => ["video"] as const,
      list: () => ["video", "list"] as const,
      single: () => ["video", "single"] as const,
    },

    paged: (page: number, pageSize: number, freeText?: string) =>
      ["video", "list", "paged", { freeText: freeText ?? null, page, pageSize }] as const,
    byId: (id: string) => ["video", "single", "byId", id] as const,
    search: (freeText: string) =>
      ["video", "list", "search", { freeText }] as const,
    similar: (videoId: string, page: number, pageSize: number) =>
      ["video", "list", "similar", videoId, { page, pageSize }] as const,
  },
  comment: {
    invalidate: {
      all: () => ["comment"] as const,
      list: () => ["comment", "list"] as const,
      single: () => ["comment", "single"] as const,
    },

    pagedByVideoId: (videoId: string, page: number, pageSize: number) =>
      ["comment", "list", "paged", videoId, { page, pageSize }] as const,
    byId: (commentId: string) => ["comment", "single", "byId", commentId] as const,
  },
  genre: {
    invalidate: {
      all: () => ["genre"] as const,
      list: () => ["genre", "list"] as const,
      single: () => ["genre", "single"] as const,
    },
    list: () => ["genre"] as const,
  },
} as const;