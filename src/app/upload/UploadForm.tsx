"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import * as yup from "yup";
import GenrePopover from "./GenrePopover";
import ArtInput from "@/components/ui/ArtInput";
import ArtTextarea from "@/components/ui/ArtTextarea";

interface Genre {
  id: string;
  name: string;
}

const schema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "At least 3 characters"),
  description: yup.string().default(""),
  file: yup
    .mixed<FileList>()
    .required("Video file is required")
    .test("required", "Please select a video file", (v) => v instanceof FileList && v.length > 0)
    .test("fileType", "Only video files are allowed", (v) => {
      if (!(v instanceof FileList) || v.length === 0) return true;
      return v[0].type.startsWith("video/");
    })
    .test("fileSize", "File must be under 500 MB", (v) => {
      if (!(v instanceof FileList) || v.length === 0) return true;
      return v[0].size <= 500 * 1024 * 1024;
    }),
});

type FormValues = yup.InferType<typeof schema>;

export default function UploadForm() {
  const router = useRouter();
  const [genres, setGenres] = useState<string[]>([]);
  const [showGenres, setShowGenres] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: allGenres = [] } = useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: () => fetch("/api/genres").then((r) => r.json()),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description ?? "");
    formData.append("video", values.file[0]);
    formData.append("genres", JSON.stringify(genres));

    const res = await fetch("/api/videos", { method: "POST", body: formData });
    const video = await res.json();
    setUploading(false);
    reset();
    setGenres([]);
    router.push(`/video/${video.id}`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div>
        <ArtInput
          icon={{ name: "Search", size: 18 }}
          clearable
          type="text"
          placeholder="Title"
          helperText={errors.title?.message}
          {...register("title")}
        />
      </div>

      <div>
        <ArtTextarea
          placeholder="Description (optional)"
          rows={3}
          helperText={errors.description?.message}
          {...register("description")}
        />
      </div>

      <div>
        <ArtInput
          type="file"
          accept="video/*"
          helperText={errors.file?.message}
          {...register("file")}
        />
      </div>

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

      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}

