'use client';

import { useState, useCallback, type CSSProperties } from 'react';
import { useCreateComment } from '@/app/video/[id]/hooks/useCreateComment';
import { API } from '@/lib/apiUrl';
import type { Comment } from '@/models/comment.models';

const PAGE_SIZE = 10;

const wrapStyle: CSSProperties = { marginTop: 24 };

const inputRow: CSSProperties = {
  display: 'flex',
  gap: 8,
  marginBottom: 16,
};

const commentStyle: CSSProperties = {
  borderBottom: '1px solid #333',
  padding: '10px 0',
  fontSize: 14,
};

const dateStyle: CSSProperties = {
  fontSize: 12,
  color: '#666',
  marginBottom: 4,
};

const loadMoreBtn: CSSProperties = {
  marginTop: 12,
  padding: '8px 20px',
  background: '#222',
  color: '#ccc',
  border: '1px solid #444',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
};

export default function CommentSection({
  videoId,
  initialComments,
}: {
  videoId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialComments.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentText, setCommentText] = useState('');

  const createComment = useCreateComment(videoId);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(API.comment.pagedByVideo(videoId, nextPage, PAGE_SIZE));
      const data = await res.json();
      setComments((prev) => [...prev, ...data.data]);
      setHasMore(data.data.length === PAGE_SIZE);
      setPage(nextPage);
    } catch {
      /* ignore */
    }
    setLoadingMore(false);
  }, [videoId, page]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    createComment.mutate(commentText, {
      onSuccess: (newComment: Comment) => {
        setComments((prev) => [newComment, ...prev]);
        setCommentText('');
      },
    });
  };

  return (
    <div style={wrapStyle}>
      <h3 style={{ marginBottom: 12 }}>Comments</h3>

      <div style={inputRow}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          onKeyDown={(e) => e.key === 'Enter' && handleComment()}
          style={{ flex: 1 }}
        />
        <button onClick={handleComment}>Send</button>
      </div>

      <div>
        {comments.map((c) => (
          <div key={c.id} style={commentStyle}>
            <div style={dateStyle}>
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

      {hasMore && (
        <button style={loadMoreBtn} onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading...' : 'Show more comments'}
        </button>
      )}
    </div>
  );
}
