import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axiosClient';
import { API } from '@/lib/apiUrl';
import { queryKeys } from '@/lib/queryKeys';
import { GenreModel, GenrePrismaModel } from '@/models/genre.models';
import { ApiError } from '@/models/api-error';

export const useGenres = () => {
  // NOTE: Typing e.g. useQuery<GenreModel[], AxiosError> only affects TypeScript checks, not what actually arrives at runtime.
  return useQuery<GenreModel[], ApiError>({
    queryKey: queryKeys.genre.list(),
    queryFn: async (): Promise<GenreModel[]> => {
      const res = await axios.get<GenreModel[]>(API.genre.list());
      return res.data;
    },
  });
};

export const useCreateGenre = () => {
  const queryClient = useQueryClient();
  return useMutation<GenreModel, ApiError, string>({
    mutationFn: async (name: string) => {
      const res = await axios.post<GenreModel>(API.genre.create(), { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.genre.invalidate.all() });
    },
  });
};
