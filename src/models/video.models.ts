import * as yup from 'yup';
import { Video as PrismaVideo } from '@prisma/client';

// ==== BE Model ====
export interface VideoPrismaModel extends PrismaVideo {}

// ==== FE Models ====
export interface VideoModel {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  videoUrl: string;
  publishedAt: string | Date;
  ageRating: AgeRating;
  genres?: { id: string; name: string }[];
}

export interface VideoLightModel {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string | null;
  description?: string;
}

export interface VideoWriteModel {
  title: string;
  description: string;
  thumbnailFile?: File | null;
  videoFile: File;
  ageRating: AgeRating;
  genreIds: string[];
}

export enum AgeRating {
  G_0 = 'G_0',
  G_12 = 'G_12',
  G_16 = 'G_16',
  G_18 = 'G_18',
}

// ==== Validator ====
export const VideoCreateValidator = yup.object({
  title: yup
    .string()
    .required('Video title is required')
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title is too long (max 200 characters)'),
  description: yup
    .string()
    .max(2000, 'Description is too long (max 2000 characters)')
    .default('')
    .trim(),
  videoFile: yup
    .mixed<File>()
    .required('Video file is required')
    .test('is-file', 'Must be a file', (value) => value instanceof File && value.size > 0),
  thumbnailFile: yup
    .mixed<File>()
    .nullable()
    .test(
      'is-file-or-null',
      'Must be a file or null',
      (value) => value == null || (value instanceof File && value.size > 0)
    ),
  ageRating: yup
    .mixed<AgeRating>()
    .oneOf(Object.values(AgeRating), 'Invalid age rating')
    .default(AgeRating.G_0),
  genreIds: yup.array().of(yup.string().uuid('Genre ID must be a valid UUID')).default([]),
});

export type VideoCreateRequest = yup.InferType<typeof VideoCreateValidator>;
