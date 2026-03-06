import * as yup from 'yup';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  videoUrl: string;
  publishedAt: string | Date;
  ageRating: AgeRating;
  genres?: { id: string; name: string }[];
}

export interface VideoLight {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string | null;
  description?: string;
}

export enum AgeRating {
  G_0 = "G_0", 
  G_12 = "G_12",
  G_16 = "G_16",
  G_18 = "G_18",
}

// Validator for creating new videos (upload)
export const VideoCreateValidator = yup.object({
  title: yup.string()
    .required('Video title is required')
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title is too long (max 200 characters)'),
  description: yup.string()
    .max(2000, 'Description is too long (max 2000 characters)')
    .default('')
    .trim(),
  videoUrl: yup.string()
    .required('Video URL is required')
    .url('Video URL must be a valid URL'),
  thumbnail: yup.string()
    .url('Thumbnail must be a valid URL')
    .optional(),
  ageRating: yup.mixed<AgeRating>()
    .oneOf(Object.values(AgeRating), 'Invalid age rating')
    .default(AgeRating.G_0),
  genreIds: yup.array()
    .of(yup.string().uuid('Genre ID must be a valid UUID'))
    .default([]),
});

export type VideoCreateRequest = yup.InferType<typeof VideoCreateValidator>;

export const VideoUpdateValidator = yup.object({
  title: yup.string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title is too long (max 200 characters)')
    .trim()
    .optional(),
  description: yup.string()
    .max(2000, 'Description is too long (max 2000 characters)')
    .trim()
    .optional(),
  thumbnail: yup.string()
    .url('Thumbnail must be a valid URL')
    .optional(),
  ageRating: yup.mixed<AgeRating>()
    .oneOf(Object.values(AgeRating), 'Invalid age rating')
    .optional(),
  genreIds: yup.array()
    .of(yup.string().uuid('Genre ID must be a valid UUID'))
    .optional(),
});

export type VideoUpdateRequest = yup.InferType<typeof VideoUpdateValidator>;

