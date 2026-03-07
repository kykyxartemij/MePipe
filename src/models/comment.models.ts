import * as yup from 'yup';
import { Comment as PrismaComment } from '@prisma/client';

// ==== BE Model ====
export interface CommentPrismaModel extends PrismaComment {}

// ==== Base FE Model ====
export interface CommentModel {
  id: string;
  text: string;
  createdAt: Date;
}

// ==== Validator ====
export const CommentCreateValidator = yup.object({
  text: yup
    .string()
    .required('Comment text is required')
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long (max 500 characters)'),
});

export type CommentCreateRequest = yup.InferType<typeof CommentCreateValidator>;
