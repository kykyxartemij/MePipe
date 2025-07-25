
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
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3001/api/videos/${id}`)
      .then(res => setVideo(res.data))
      .catch(err => console.error('Error fetching video:', err));
    
    axios.get(`http://localhost:3001/api/videos/${id}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error('Error fetching comments:', err));
  }, [id]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post(`http://localhost:3001/api/videos/${id}/comments`, { text: commentText });
      setCommentText('');
      const res = await axios.get(`http://localhost:3001/api/videos/${id}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (!video) return <div>Loading...</div>;

  return (
    <div className="video-player-container">
      <div className="video-player">
        {videoError ? (
          <div style={{
            width: '100%',
            height: '480px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            borderRadius: '12px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>🎬</div>
            <div>Video Placeholder</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              (Sample video for demo purposes)
            </div>
          </div>
        ) : (
          <video 
            src={`http://localhost:3001${video.url}`} 
            controls 
            style={{ width: '100%', borderRadius: '12px' }}
            onError={() => setVideoError(true)}
          />
        )}
      </div>
      
      <div className="video-meta">
        <h1 className="video-title-large">{video.title}</h1>
        <div className="video-stats">
          0 views • Just now
        </div>
        {video.description && (
          <div className="video-description-full">
            {video.description}
          </div>
        )}
      </div>

      <div className="comments-section">
        <h3 className="comments-title">{comments.length} Comments</h3>
        
        <div className="comment-form">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="comment-input"
          />
          <button onClick={handleComment} className="comment-button">
            Comment
          </button>
        </div>

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-text">{comment.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
