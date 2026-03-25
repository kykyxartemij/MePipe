'use client';

import { useState } from 'react';
import { usePagedCommentsByVideoId, useCreateComment } from '@/hooks/comment.hooks';
import ArtInput from '@/components/ui/ArtInput';
import ArtButton from '@/components/ui/ArtButton';
import ArtSkeleton from '@/components/ui/ArtSkeleton';
import type { CommentModel } from '@/models/comment.models';

const PAGE_SIZE = 100;

/* ─── CommentInput ─────────────────────────────────────────────────────────
   Isolated so useCreateComment / useMutation re-renders stay in this sub-tree.
───────────────────────────────────────────────────────────────────────────── */
function CommentInput({ videoId, disabled }: { videoId: string; disabled: boolean }) {
  const [commentText, setCommentText] = useState('');
  const createComment = useCreateComment(videoId);

  const handleComment = () => {
    const text = commentText.trim();
    if (!text) return;
    createComment.mutate(text, {
      onSuccess: () => setCommentText(''),
    });
  };

  return (
    <div className="flex gap-2 mb-5">
      <ArtInput
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Add a comment..."
        onKeyDown={(e) => e.key === 'Enter' && handleComment()}
        disabled={disabled}
      />
      <ArtButton onClick={handleComment} disabled={disabled || createComment.isPending}>
        {createComment.isPending ? 'Sending...' : 'Send'}
      </ArtButton>
    </div>
  );
}

/* ─── CommentSection ─── */
export default function CommentSection({ videoId }: { videoId: string }) {
  const { data, isLoading } = usePagedCommentsByVideoId(videoId, 1, PAGE_SIZE);

  const totalComments = data?.total ?? 0;
  const comments = data?.data ?? [];

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-semibold">
        {isLoading ? 'Comments' : `${totalComments} Comment${totalComments === 1 ? '' : 's'}`}
      </h3>

      <CommentInput videoId={videoId} disabled={isLoading} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <ArtSkeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((c: CommentModel) => (
            <div key={c.id} className="rounded-lg bg-(--surface) px-3 py-2.5">
              <div className="text-[11px] text-muted mb-1.5 tracking-wide">
                {new Date(c.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <p className="text-sm leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
