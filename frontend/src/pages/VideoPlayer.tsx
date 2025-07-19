
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
}

interface Comment {
  id: string;
  text: string;
}

export default function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    axios.get(`/api/videos/${id}`).then(res => setVideo(res.data));
    axios.get(`/api/videos/${id}/comments`).then(res => setComments(res.data));
  }, [id]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await axios.post(`/api/videos/${id}/comments`, { text: commentText });
    setCommentText('');
    const res = await axios.get(`/api/videos/${id}/comments`);
    setComments(res.data);
  };

  if (!video) return <div>Loading...</div>;

  return (
    <div>
      <h2>{video.title}</h2>
      <video src={video.url} controls width={640} />
      <p>{video.description}</p>
      <h3>Comments</h3>
      <div>
        {comments.map((c) => (
          <div key={c.id} style={{ borderBottom: '1px solid #ccc', marginBottom: 8 }}>
            {c.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={commentText}
        onChange={e => setCommentText(e.target.value)}
        placeholder="Add a comment..."
      />
      <button onClick={handleComment}>Send</button>
    </div>
  );
}
