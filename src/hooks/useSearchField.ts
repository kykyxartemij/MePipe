import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/apiUrl";
import { queryKeys } from "@/lib/queryKeys";

export const useSearchField = (freeText: string) => {
  return useQuery({
    queryKey: queryKeys.videos.search(freeText),
    queryFn: async () => {
      const res = await fetch(API.video.search(freeText));
      if (!res.ok) throw new Error("Failed to fetch search suggestions");
      return res.json() as Promise<string[]>;
    },
    enabled: freeText.trim().length > 0,
  });
};
