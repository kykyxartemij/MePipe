import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/apiUrl";
import { queryKeys } from "@/lib/queryKeys";
import type { Comment } from "@/models/comment.models";

export const useCreateComment = (videoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string): Promise<Comment> => {
      const res = await fetch(API.comment.create(videoId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to create comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.pagedByVideo(videoId) });
    },
  });
};
