
import { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from '../components/VideoCard';


const PAGE_SIZE = 20;

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios.get(`/api/videos-paged?page=${page}&pageSize=${PAGE_SIZE}&title=${title}`)
      .then(res => {
        setVideos(res.data.videos);
        setTotal(res.data.total);
      });
  }, [page, title]);

  return (
    <div>
      <h2>Video List</h2>
      <input
        type="text"
        placeholder="Search by title..."
        value={title}
        onChange={e => { setTitle(e.target.value); setPage(1); }}
        style={{ marginBottom: 16 }}
      />
      <div>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span style={{ margin: '0 8px' }}>Page {page}</span>
        <button disabled={page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
