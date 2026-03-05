// Structure of the file is based on scheme.prisma, in DB we divide into collections, somewhat same here

export const API = {
  video: {
    paged: (page: number, pageSize: number, freeText?: string) => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (freeText) params.set('freeText', freeText);
      return `/api/video?${params.toString()}`;
    },
    details: (videoId: string) => { // TODO: Rename to "single"
      return `/api/video/${videoId}`;
    },
    similar: (videoId: string, page: number, pageSize: number) => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      return `/api/video/${videoId}/similar?${params.toString()}`;
    },
    suggestions: (freeText: string) => {
      return `/api/video/suggestions?freeText=${encodeURIComponent(freeText)}`;
    },
  },
  comment: {
    pagedByVideo: (videoId: string, page: number, pageSize: number) => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      return `/api/video/${videoId}/comments?${params.toString()}`;
    },
    create: (videoId: string) => {
      return `/api/video/${videoId}/comments`;
    },
  },
  genre: {
    list: () => {
      return '/api/genre';
    },
  },
} as const;