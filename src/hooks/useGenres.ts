import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/apiUrl";
import { queryKeys } from "@/lib/queryKeys";
import { Genre } from "@/models/genre.models";

export const useGenres = () => {
  return useQuery<Genre[]>({
    queryKey: queryKeys.genres.list(),
    queryFn: async (): Promise<Genre[]> => {
      const res = await fetch(API.genre.list());
      if (!res.ok) throw new Error("Failed to fetch genres");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};