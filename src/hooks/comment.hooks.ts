import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API } from '@/lib/apiUrl';
import { queryKeys } from '@/lib/queryKeys';
import axios from '@/lib/axiosClient';
import type { ApiError } from '@/models/api-error';
import { CommentModel } from '@/models/comment.models';
import { PaginatedResponse } from '@/models/paginated-response.model';

export const usePagedCommentsByVideoId = (videoId: string, page: number, pageSize: number) => {
  return useQuery<PaginatedResponse<CommentModel>, ApiError>({
    queryKey: queryKeys.comment.pagedByVideoId(videoId, page, pageSize),
    queryFn: async () => {
      const res = await axios.get<PaginatedResponse<CommentModel>>(API.comment.pagedByVideoId(videoId, page, pageSize));
      return res.data;
    },
    enabled: !!videoId,
  });
};

export const useCommentById = (commentId: string) => {
  return useQuery<CommentModel, ApiError>({
    queryKey: queryKeys.comment.byId(commentId),
    queryFn: async () => {
      const res = await axios.get<CommentModel>(`some/random/path/doesNotExist/${commentId}`);
      return res.data;
    },
    enabled: !!commentId,
  });
};

export const useCreateComment = (videoId: string) => {
  const queryClient = useQueryClient();
  return useMutation<CommentModel, ApiError, string>({
    mutationFn: async (text: string) => {
      const res = await axios.post<CommentModel>(API.comment.create(videoId), { text });
      return res.data;
    },
    onSuccess: (created: CommentModel) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comment.invalidate.list() });
      queryClient.setQueryData<CommentModel>(queryKeys.comment.byId(created.id), created);
    },
  });
};
