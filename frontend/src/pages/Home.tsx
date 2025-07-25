
import { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from '../components/VideoCard';

const PAGE_SIZE = 20;

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
  views?: number;
  likes?: number;
  dislikes?: number;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:3001/api/videos-paged?page=${page}&pageSize=${PAGE_SIZE}&title=${title}`)
      .then(res => {
        setVideos(res.data.videos || []);
        setTotal(res.data.total || 0);
      })
      .catch(err => {
        console.error('Error fetching videos:', err);
        setVideos([]);
        setTotal(0);
      });
  }, [page, title]);

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search videos..."
          value={title}
          onChange={e => { setTitle(e.target.value); setPage(1); }}
          className="search-input"
        />
      </div>
      
      <div className="video-grid">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      
      <div className="pagination">
        <button 
          className="pagination-button" 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span className="page-info">Page {page}</span>
        <button 
          className="pagination-button" 
          disabled={page * PAGE_SIZE >= total} 
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
