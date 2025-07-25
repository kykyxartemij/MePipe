
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
  views?: number;
  likes?: number;
  dislikes?: number;
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
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [views, setViews] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:3001/api/videos/${id}`)
      .then(res => {
        setVideo(res.data);
        setLikes(res.data.likes || 0);
        setDislikes(res.data.dislikes || 0);
        setViews(res.data.views || 0);
        // Increment view count when video loads
        axios.post(`http://localhost:3001/api/videos/${id}/view`).catch(() => {});
      })
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

  const handleLike = async () => {
    try {
      const res = await axios.post(`http://localhost:3001/api/videos/${id}/like`);
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDislike = async () => {
    try {
      const res = await axios.post(`http://localhost:3001/api/videos/${id}/dislike`);
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
    } catch (error) {
      console.error('Error disliking video:', error);
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
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
          {formatViews(views)} views • Just now
        </div>
        
        {/* Like/Dislike buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          margin: '16px 0',
          alignItems: 'center'
        }}>
          <button 
            onClick={handleLike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid #ccc',
              background: 'white',
              borderRadius: '18px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            👍 {likes}
          </button>
          <button 
            onClick={handleDislike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid #ccc',
              background: 'white',
              borderRadius: '18px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            👎 {dislikes}
          </button>
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
