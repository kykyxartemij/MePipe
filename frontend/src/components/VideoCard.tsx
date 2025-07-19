
import { Link } from 'react-router-dom';

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <div style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
      <Link to={`/video/${video.id}`}>
        <h3>{video.title}</h3>
      </Link>
      <video src={video.url} controls width={320} />
      <p>{video.description}</p>
    </div>
  );
}
