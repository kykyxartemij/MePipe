'use client';

import { useState } from 'react';
import { usePagedCommentsByVideoId, useCreateComment } from '@/hooks/comment.hooks';
import ArtInput from '@/components/ui/ArtInput';
import type { CommentModel } from '@/models/comment.models';

const PAGE_SIZE = 100;

export default function CommentSection({ videoId }: { videoId: string }) {
  const [localComments, setLocalComments] = useState<CommentModel[]>([]);
  const [commentText, setCommentText] = useState('');

  const { data, isLoading } = usePagedCommentsByVideoId(videoId, 1, PAGE_SIZE);
  const createComment = useCreateComment(videoId);

  const serverComments = data?.data ?? [];
  const comments = [...localComments, ...serverComments];

  const handleComment = () => {
    const text = commentText.trim();
    if (!text) return;
    createComment.mutate(text, {
      onSuccess: (newComment: CommentModel) => {
        setLocalComments((prev) => [newComment, ...prev]);
        setCommentText('');
      },
    });
  };

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-semibold">Comments</h3>

      <div className="flex gap-2 mb-4">
        <ArtInput
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          onKeyDown={(e) => e.key === 'Enter' && handleComment()}
        />
        <button className="btn" onClick={handleComment} disabled={createComment.isPending}>
          {createComment.isPending ? 'Sending...' : 'Send'}
        </button>
      </div>

      {isLoading && <p className="text-sm text-[var(--text-muted)]">Loading comments...</p>}

      <div>
        {comments.map((c) => (
          <div key={c.id} className="border-b border-[var(--border)] py-2.5 text-sm">
            <div className="text-xs text-[var(--text-muted)] mb-1">
              {new Date(c.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            {c.text}
          </div>
        ))}
      </div>
    </div>
  );
}
