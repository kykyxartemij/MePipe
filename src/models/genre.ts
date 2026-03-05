import * as yup from 'yup';

export interface Genre {
  id: string;   // String @id @default(uuid()) @map("_id")
  name: string; // String @unique
}

// Validator
export const GenreCreateValidator = yup.object({
  name: yup.string()
    .required('Genre name is required')
    .trim()
    .min(1, 'Genre name cannot be empty')
    .max(50, 'Genre name is too long (max 50 characters)'),
});

export type GenreCreateRequest = yup.InferType<typeof GenreCreateValidator>;
