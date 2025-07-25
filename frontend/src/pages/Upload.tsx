
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3001/api/genres').then(res => setAllGenres(res.data));
  }, []);

  const handleUpload = async () => {
    if (!title || !file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('video', file);
      formData.append('genres', JSON.stringify(genres));
      await axios.post('http://localhost:3001/api/videos', formData);
      setTitle('');
      setDescription('');
      setFile(null);
      setGenres([]);
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '24px', fontWeight: '500' }}>
        Upload Video
      </h2>
      
      <div className="upload-form">
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            type="text"
            placeholder="Enter video title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            placeholder="Tell viewers about your video"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Video File *</label>
          <input 
            type="file" 
            accept="video/*" 
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Genres</label>
          <button 
            type="button" 
            onClick={() => setShowGenres(true)}
            className="form-input"
            style={{ 
              cursor: 'pointer', 
              textAlign: 'left', 
              background: 'white',
              border: '1px solid #ccc'
            }}
          >
            {genres.length > 0 ? `${genres.length} genres selected` : 'Select genres'}
          </button>
        </div>

        <GenrePopover
          open={showGenres}
          genres={allGenres}
          selected={genres}
          onSelect={setGenres}
          onClose={() => setShowGenres(false)}
        />

        <button 
          onClick={handleUpload} 
          className="upload-button"
          disabled={!title || !file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </div>
    </div>
  );
}
