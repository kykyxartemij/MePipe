import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import Upload from './pages/Upload';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="header">
        <nav className="nav">
          <Link to="/" className="logo">MePipe</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/upload" className="nav-link">Upload</Link>
          </div>
        </nav>
      </div>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/video/:id" element={<VideoPlayer />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
