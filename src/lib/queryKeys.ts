// Centralized query keys for React Query
export const queryKeys = {
  videos: {
    paged: (freeText?: string) =>
      ["videos", "paged", { freeText: freeText ?? null }] as const,
    suggestions: (freeText: string) => // TODO: Rename suggestion, to like... "search" or something
      ["videos", "suggestions", { freeText }] as const,
    similar: (videoId: string, page: number, pageSize: number) =>
      ["videos", "similar", videoId, { page, pageSize }] as const,
  },
  comments: {
    pagedByVideo: (videoId: string, pageSize?: number) =>
      ["comments", "video", videoId, { pageSize: pageSize ?? null }] as const,
  },
  genres: {
    list: (q?: string) => ["genres", { q: q ?? null }] as const,
  },
} as const;