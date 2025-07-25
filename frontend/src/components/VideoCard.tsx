
import { Link } from 'react-router-dom';

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
  views?: number;
  likes?: number;
  dislikes?: number;
}

export default function VideoCard({ video }: { video: Video }) {
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className="video-card">
      <Link to={`/video/${video.id}`}>
        <div className="video-thumbnail-container">
          {/* For now, we'll show a placeholder thumbnail since we don't have actual video thumbnails */}
          <div style={{ 
            width: '100%', 
            height: '100%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: '500'
          }}>
            📹
          </div>
          <div className="video-duration">0:00</div>
        </div>
      </Link>
      <div className="video-info">
        <Link to={`/video/${video.id}`} className="video-title">
          {video.title}
        </Link>
        <div className="video-description">
          {video.description || 'No description available'}
        </div>
        <div style={{ fontSize: '12px', color: '#606060', marginTop: '4px' }}>
          {video.views ? `${formatViews(video.views)} views` : '0 views'}
        </div>
      </div>
    </div>
  );
}
