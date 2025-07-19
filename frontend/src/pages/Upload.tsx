
import { useEffect, useState } from 'react';
import axios from 'axios';
import GenrePopover from '../components/GenrePopover';

interface Genre {
  id: string;
  name: string;
}


export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [showGenres, setShowGenres] = useState(false);

  useEffect(() => {
    axios.get('/api/genres').then(res => setAllGenres(res.data));
  }, []);

  const handleUpload = async () => {
    if (!title || !file) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video', file);
    formData.append('genres', JSON.stringify(genres));
    await axios.post('/api/videos', formData);
    setTitle('');
    setDescription('');
    setFile(null);
    setGenres([]);
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button type="button" onClick={() => setShowGenres(true)}>
        Select Genres
      </button>
      <GenrePopover
        open={showGenres}
        genres={allGenres}
        selected={genres}
        onSelect={setGenres}
        onClose={() => setShowGenres(false)}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
