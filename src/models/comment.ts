import * as yup from 'yup';

// ==== Domain Based Model ====
export interface Comment {
  id: string; // String @id @default(uuid()) @map("_id")
  text: string; // String
  createdAt: Date; // DateTime @default(now())
  videoId: string; // String
}

// ==== Validator ====

export const CommentCreateValidator = yup.object({
  text: yup.string()
    .required('Comment text is required')
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long (max 500 characters)'),
});

export type CommentCreateRequest = yup.InferType<typeof CommentCreateValidator>;

