import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { API } from "@/lib/apiUrl";
import { queryKeys } from "@/lib/queryKeys";
import { VideoLight } from "@/models/video.models";

interface PagedVideosResponse {
  videos: VideoLight[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 20;

async function fetchPagedVideos(page: number, freeText: string): Promise<PagedVideosResponse> {
  const res = await fetch(API.video.paged(page, PAGE_SIZE, freeText));
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
}

export const usePagedVideos = (search = "") => {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.paged(search),
    queryFn: ({ pageParam }) => fetchPagedVideos(pageParam, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
};

// Rename to SimilarVideos
export const useSimilarVideos = (videoId: string) => {
  return useQuery({
    queryKey: queryKeys.videos.similar(videoId, 1, 15),
    queryFn: async () => {
      const res = await fetch(API.video.similar(videoId, 1, 15));
      if (!res.ok) throw new Error("Failed to fetch similar videos");
      return res.json() as Promise<VideoLight[]>;
    },
    enabled: !!videoId,
  });
};

export const useVideoSuggestions = (freeText: string) => {
  return useQuery({
    queryKey: queryKeys.videos.suggestions(freeText),
    queryFn: async () => {
      const res = await fetch(API.video.suggestions(freeText));
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      return res.json() as Promise<string[]>;
    },
    enabled: freeText.trim().length > 0,
  });
};