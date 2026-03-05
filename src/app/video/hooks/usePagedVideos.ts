import { useInfiniteQuery } from "@tanstack/react-query";
import { API } from "@/lib/apiUrl";
import { queryKeys } from "@/lib/queryKeys";

const PAGE_SIZE = 20;

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string | null;
  description?: string;
}

interface VideosResponse {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
}

async function fetchVideos(page: number, freeText: string): Promise<VideosResponse> {
  const res = await fetch(API.video.paged(page, PAGE_SIZE, freeText));
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
}

export const usePagedVideos = (search = "") => {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.paged(search),
    queryFn: ({ pageParam }) => fetchVideos(pageParam, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
};