import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '@/lib/apiUrl';
import { queryKeys } from '@/lib/queryKeys';
import { VideoLightModel, VideoModel } from '@/models/video.models';
import { PaginatedResponse, getNextPage } from '@/models/paginated-response.model';
import axios from '@/lib/axiosClient';
import type { AxiosProgressEvent, AxiosError } from 'axios';
import { ApiError } from '@/models/api-error';

export const usePagedVideos = (page: number, pageSize: number, freeText?: string) => {
  return useInfiniteQuery<PaginatedResponse<VideoLightModel>, ApiError>({
    queryKey: queryKeys.video.paged(page, pageSize, freeText),
    queryFn: async () => {
      const res = await axios.get<PaginatedResponse<VideoLightModel>>(API.video.paged(page, pageSize, freeText));
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: getNextPage,
  });
};

export const useById = (id: string) => {
  return useQuery<VideoModel, ApiError>({
    queryKey: queryKeys.video.byId(id),
    queryFn: async () => {
      const res = await axios.get<VideoModel>(API.video.byId(id));
      return res.data;
    },
    enabled: !!id,
  });
};

export const useSimilarVideos = (videoId: string, page: number, pageSize: number) => {
  return useQuery<PaginatedResponse<VideoLightModel>, ApiError>({
    queryKey: queryKeys.video.similar(videoId, page, pageSize),
    queryFn: async () => {
      const res = await axios.get<PaginatedResponse<VideoLightModel>>(API.video.similar(videoId, page, pageSize));
      return res.data;
    },
    enabled: !!videoId,
  });
};

export const useSearchField = (freeText: string) => {
  return useQuery<string[], ApiError>({
    queryKey: queryKeys.video.search(freeText),
    queryFn: async () => {
      const res = await axios.get<string[]>(API.video.search(freeText));
      return res.data;
    },
    enabled: !!freeText.trim().length,
  });
};

export const useCreateVideo = (callbacks?: { onUploadProgress?: (pct: number) => void }) => {
  const queryClient = useQueryClient();
  return useMutation<VideoModel, ApiError, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post<VideoModel>(API.video.create(), formData, {
        onUploadProgress: (evt?: AxiosProgressEvent) => {
          const pct = evt?.total ? Math.round((evt.loaded / evt.total) * 100) : 0;
          callbacks?.onUploadProgress?.(pct);
        },
      });
      return res.data;
    },
    onSuccess: (created: VideoModel) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video.invalidate.list() });
      queryClient.setQueryData<VideoModel>(queryKeys.video.byId(created.id), created);
    },
  });
};
