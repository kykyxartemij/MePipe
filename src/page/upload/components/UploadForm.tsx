'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ArtInput from '@/components/ui/ArtInput';
import ArtTextarea from '@/components/ui/ArtTextarea';
import ArtForm from '@/components/ui/ArtForm';
import ArtSelect from '@/components/ui/ArtSelect';
import ArtUpload from '@/components/ui/ArtUpload';
import ArtProgress from '@/components/ui/ArtProgress';
import ArtSkeleton from '@/components/ui/ArtSkeleton';
import { useCreateVideo } from '@/hooks/video.hooks';
import GenreDialog from './GenreDialog';
import { AgeRating, type VideoModel } from '@/models/video.models';
import type { ArtSelectOption } from '@/components/ui/ArtSelect';

// Text rules mirror VideoCreateValidator (same min/max/trim) — keep in sync when BE rules change.
const schema = yup.object({
  title: yup.string().required('Title is required').trim().min(1, 'Title cannot be empty').max(200, 'Title too long (max 200 chars)'),
  description: yup.string().max(2000, 'Description too long (max 2000 chars)').default('').trim(),
  videoFile: yup
    .mixed<FileList>()
    .required('Video file is required')
    .test('required', 'Please select a video file', (v) => v instanceof FileList && v.length > 0)
    .test('type', 'Only video files are allowed', (v) => !(v instanceof FileList) || !v.length || v[0].type.startsWith('video/'))
    .test('size', 'File must be under 500 MB', (v) => !(v instanceof FileList) || !v.length || v[0].size <= 500 * 1024 * 1024),
  thumbnailFile: yup
    .mixed<FileList>()
    .optional()
    .test('type', 'Only image files are allowed', (v) => !(v instanceof FileList) || !v.length || v[0].type.startsWith('image/'))
    .test('size', 'Thumbnail must be under 10 MB', (v) => !(v instanceof FileList) || !v.length || v[0].size <= 10 * 1024 * 1024),
});

type FormValues = yup.InferType<typeof schema>;

const AGE_RATING_OPTIONS: ArtSelectOption[] = [
  { value: AgeRating.G_0,  label: 'All ages' },
  { value: AgeRating.G_12, label: '12+' },
  { value: AgeRating.G_16, label: '16+' },
  { value: AgeRating.G_18, label: '18+' },
];

export default function UploadForm({ loading = false }: { loading?: boolean }) {
  const router = useRouter();
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [ageRating, setAgeRating] = useState<AgeRating>(AgeRating.G_0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createVideo = useCreateVideo({ onUploadProgress: setUploadProgress });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema) as any, // yupResolver optional-field inference mismatch — runtime is correct
  });

  if (loading) return <Skeleton />;

  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description ?? '');
    formData.append('video', (values.videoFile as FileList)[0]);
    const thumb = (values.thumbnailFile as FileList | null)?.[0];
    if (thumb) formData.append('thumbnail', thumb);
    formData.append('ageRating', ageRating);
    formData.append('genres', JSON.stringify(genreIds));

    setUploadProgress(0);
    createVideo.mutate(formData, {
      onSuccess: (video: VideoModel) => {
        reset();
        setGenreIds([]);
        setAgeRating(AgeRating.G_0);
        router.push(`/video/${video.id}`);
      },
    });
  };

  return (
    <ArtForm
      onSubmit={handleSubmit(onSubmit)}
      buttons={[{ label: 'Upload', color: 'primary', type: 'submit', loading: createVideo.isPending }]}
    >
      {/* Title */}
      <ArtInput
        label="Title"
        required
        type="text"
        placeholder="Give your video a title…"
        helperText={errors.title?.message}
        {...register('title')}
      />

      {/* Upload Video */}
      <ArtUpload
        label="Video"
        required
        accept="video/*"
        hint="MP4, WebM, MOV · max 500 MB"
        helperText={errors.videoFile?.message}
        {...register('videoFile')}
      />      
      
      {/* Description */}
      <ArtTextarea
        label="Description"
        placeholder="Tell viewers about your video…"
        rows={6}
        maxRows={6}
        helperText={errors.description?.message}
        {...register('description')}
      />

      {/* ── Thumbnail / Age rating / Genres ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="row-span-2">
          <ArtUpload
            label="Thumbnail"
            accept="image/*"
            hint="JPG, PNG · max 10 MB"
            helperText={errors.thumbnailFile?.message}
            {...register('thumbnailFile')}
          />
        </div>
        <ArtSelect
          label="Age rating"
          options={AGE_RATING_OPTIONS}
          selected={AGE_RATING_OPTIONS.find((o) => o.value === ageRating)}
          onChange={(opt: ArtSelectOption | null) => opt && setAgeRating(opt.value as AgeRating)}
          placeholder="Age rating"
        />
        <GenreDialog selected={genreIds} onSelect={setGenreIds} />
      </div>

      {/* ── Upload progress ───────────────────────────────────────────────── */}
      {/* {createVideo.isPending && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Processing…'}
          </span>
          <ArtProgress value={uploadProgress} max={100} color="primary" />
        </div>
      )} */}

    </ArtForm>
  );
}

// Skeleton mirrors the form layout — update both together
function Skeleton() {
  return (
    <div className="flex flex-col gap-5">
      <ArtSkeleton className="h-22 w-full rounded-lg" />
      <div className="flex gap-4">
        <ArtSkeleton className="h-10 flex-1 rounded-md" />
        <ArtSkeleton className="h-22 w-52 rounded-lg" />
      </div>
      <ArtSkeleton className="h-24 w-full rounded-md" />
      <div className="flex gap-4">
        <ArtSkeleton className="h-10 flex-1 rounded-md" />
        <ArtSkeleton className="h-10 flex-1 rounded-md" />
      </div>
      <ArtSkeleton className="h-10 w-full rounded-md" />
    </div>
  );
}
