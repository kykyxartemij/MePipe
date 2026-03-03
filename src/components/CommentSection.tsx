"use client";

import { useState } from "react";

interface Comment {
  id: string;
  text: string;
  createdAt: string | Date;
}

export default function CommentSection({
  videoId,
  initialComments,
}: {
  videoId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState("");

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const res = await fetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText }),
    });
    const newComment = await res.json();
    setComments([newComment, ...comments]);
    setCommentText("");
  };

  return (
    <div>
      <h3 style={{ marginTop: 24 }}>Comments</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, maxWidth: 600 }}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          onKeyDown={(e) => e.key === "Enter" && handleComment()}
        />
        <button onClick={handleComment}>Send</button>
      </div>
      <div>
        {comments.map((c) => (
          <div
            key={c.id}
            style={{
              borderBottom: "1px solid var(--border)",
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            {c.text}
          </div>
        ))}
      </div>
    </div>
  );
}
