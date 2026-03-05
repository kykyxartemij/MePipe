"use client";

import { useState, useCallback, type CSSProperties } from "react";

import type { Comment } from "@/models/comment";

const PAGE_SIZE = 10;

const wrapStyle: CSSProperties = { marginTop: 24 };

const inputRow: CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 16,
};

const commentStyle: CSSProperties = {
  borderBottom: "1px solid #333",
  padding: "10px 0",
  fontSize: 14,
};

const dateStyle: CSSProperties = {
  fontSize: 12,
  color: "#666",
  marginBottom: 4,
};

const loadMoreBtn: CSSProperties = {
  marginTop: 12,
  padding: "8px 20px",
  background: "#222",
  color: "#ccc",
  border: "1px solid #444",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
};

export default function CommentSection({
  videoId,
  initialComments,
  totalComments,
}: {
  videoId: string;
  initialComments: Comment[];
  totalComments: number;
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [total, setTotal] = useState(totalComments);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentText, setCommentText] = useState("");

  const hasMore = comments.length < total;

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/videos/${videoId}/comments?page=${nextPage}&pageSize=${PAGE_SIZE}`);
      const data = await res.json();
      setComments((prev) => [...prev, ...data.comments]);
      setTotal(data.total);
      setPage(nextPage);
    } catch { /* ignore */ }
    setLoadingMore(false);
  }, [videoId, page]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const res = await fetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText }),
    });
    const newComment = await res.json();
    setComments([newComment, ...comments]);
    setTotal((t) => t + 1);
    setCommentText("");
  };

  return (
    <div style={wrapStyle}>
      <h3 style={{ marginBottom: 12 }}>{total} Comment{total !== 1 ? "s" : ""}</h3>

      <div style={inputRow}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          onKeyDown={(e) => e.key === "Enter" && handleComment()}
          style={{ flex: 1 }}
        />
        <button onClick={handleComment}>Send</button>
      </div>

      <div>
        {comments.map((c) => (
          <div key={c.id} style={commentStyle}>
            <div style={dateStyle}>
              {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
            {c.text}
          </div>
        ))}
      </div>

      {hasMore && (
        <button style={loadMoreBtn} onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? "Loading..." : "Show more comments"}
        </button>
      )}
    </div>
  );
}
