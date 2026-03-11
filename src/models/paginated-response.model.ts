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

// TODO: Define usefullity of this function. Find out is it better to rely on total or just check if page was full.
export function getNextPage(lastPage: PaginatedResponse<unknown>): number | undefined {
  // Primary source: if current page is not full, there is no next page.
  if (lastPage.data.length < lastPage.pageSize) return undefined;

  // If backend provides a positive total, use it to verify whether there is a next page.
  if (lastPage.total > 0) {
    return lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined;
  }

  // No total available but page was full — assume there is a next page.
  return lastPage.page + 1;
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
