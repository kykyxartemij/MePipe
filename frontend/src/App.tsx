import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import Upload from './pages/Upload';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ marginBottom: 24 }}>
        <Link to="/" style={{ marginRight: 16 }}>Home</Link>
        <Link to="/upload">Upload</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/video/:id" element={<VideoPlayer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
