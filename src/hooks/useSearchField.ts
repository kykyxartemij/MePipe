import { useVideoSuggestions } from "@/app/video/hooks/useVideoHooks";

export const useSearchField = (debouncedQuery: string) => {
  const { data: suggestions, isLoading } = useVideoSuggestions(debouncedQuery);

  return {
    suggestions: suggestions || [],
    isLoading,
  };
};