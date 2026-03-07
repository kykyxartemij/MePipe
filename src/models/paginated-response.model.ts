import * as yup from 'yup';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ==== Validator ====
export const PaginatedResponseValidator = yup.object({
  page: yup
    .number()
    .integer('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  pageSize: yup
    .number()
    .integer('Page size must be an integer')
    .min(1, 'Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100')
    .default(10),
});

export type PaginationResponseParams = yup.InferType<typeof PaginatedResponseValidator>;

// ==== Helpers ====
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total?: number
) {
  return { data, page, pageSize, total: total ?? 0 };
}

// ==== URL Parameter Extraction Utilities ====
export async function parsePaginationFromUrl(
  searchParams: URLSearchParams
): Promise<PaginationResponseParams> {
  const rawParams = {
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  };

  const paginationData = {
    page: rawParams.page ? Number(rawParams.page) : 1,
    pageSize: rawParams.pageSize ? Number(rawParams.pageSize) : 100,
  };

  return await PaginatedResponseValidator.validate(paginationData);
}
