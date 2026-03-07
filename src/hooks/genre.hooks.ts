import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { API } from '@/lib/apiUrl';
import { queryKeys } from '@/lib/queryKeys';
import { GenreModel, GenrePrismaModel } from '@/models/genre.models';

export const useGenres = () => {
  return useQuery<GenreModel[], AxiosError>({
    queryKey: queryKeys.genre.list(),
    queryFn: async (): Promise<GenreModel[]> => {
      const res = await axios.get<GenreModel[]>(API.genre.list());
      return res.data;
    },
  });
};

export const useCreateGenre = () => {
  const queryClient = useQueryClient();
  return useMutation<GenreModel, AxiosError, string>({
    mutationFn: async (name: string) => {
      const res = await axios.post<GenreModel>(API.genre.create(), { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.genre.invalidate.all() });
    },
  });
};
