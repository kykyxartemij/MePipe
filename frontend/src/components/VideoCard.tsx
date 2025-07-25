
import { Link } from 'react-router-dom';

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export default function VideoCard({ video }: { video: Video }) {
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
      </div>
    </div>
  );
}
