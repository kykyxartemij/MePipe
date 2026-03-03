"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenrePopover from "./GenrePopover";

interface Genre {
  id: string;
  name: string;
}

export default function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [showGenres, setShowGenres] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/genres")
      .then((r) => r.json())
      .then(setAllGenres);
  }, []);

  const handleUpload = async () => {
    if (!title || !file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", file);
    formData.append("genres", JSON.stringify(genres));

    const res = await fetch("/api/videos", { method: "POST", body: formData });
    const video = await res.json();
    setUploading(false);
    router.push(`/video/${video.id}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="button" onClick={() => setShowGenres(true)}>
        Select Genres {genres.length > 0 && `(${genres.length})`}
      </button>
      <GenrePopover
        open={showGenres}
        genres={allGenres}
        selected={genres}
        onSelect={setGenres}
        onClose={() => setShowGenres(false)}
      />
      <button onClick={handleUpload} disabled={!title || !file || uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
