import * as yup from 'yup';
import { Genre as PrismaGenre } from '@prisma/client';

// ==== BE Model ====
export interface GenrePrismaModel extends PrismaGenre {}

// ==== FE Model ====
export interface GenreModel {
  id: string;
  name: string;
}

// ==== Validator ====
export const GenreCreateValidator = yup.object({
  name: yup
    .string()
    .required('Genre name is required')
    .trim()
    .min(1, 'Genre name cannot be empty')
    .max(50, 'Genre name is too long (max 50 characters)'),
});

export type GenreCreateRequest = yup.InferType<typeof GenreCreateValidator>;
