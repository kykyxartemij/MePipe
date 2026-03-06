import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/apiUrl";
import { queryKeys } from "@/lib/queryKeys";
import type { VideoLight } from "@/models/video.models";
import type { PaginatedResponse } from "@/models/paginated-response.model";

const PAGE_SIZE = 100;
const SIMILAR_PAGE_SIZE = 75;

async function fetchPagedVideos(page: number, freeText: string): Promise<PaginatedResponse<VideoLight>> {
  const res = await fetch(API.video.paged(page, PAGE_SIZE, freeText));
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
}

export const usePagedVideos = (search = "") => {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.paged(search),
    queryFn: ({ pageParam }) => fetchPagedVideos(pageParam, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.data.length < lastPage.pageSize ? undefined : lastPage.page + 1,
  });
};

export const useSimilarVideos = (videoId: string) => {
  return useQuery({
    queryKey: queryKeys.videos.similar(videoId, 1, SIMILAR_PAGE_SIZE),
    queryFn: async () => {
      const res = await fetch(API.video.similar(videoId, 1, SIMILAR_PAGE_SIZE));
      if (!res.ok) throw new Error("Failed to fetch similar videos");
      return res.json() as Promise<VideoLight[]>;
    },
    enabled: !!videoId,
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/video", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to create video");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
};