/**
 * Shared utilities for free-text search / filtering.
 *
 * For fuzzy matching improvements see freetext-filtering-improvements.md
 * in this same directory.
 */

/** Max length for any search/free-text input. */
const MAX_TEXT_LENGTH = 100;

/** Normalise a string: trim whitespace, lowercase, cap at 100 chars. */
export function normalizeText(value: string): string {
  return value.trim().toLowerCase().slice(0, MAX_TEXT_LENGTH);
}

/**
 * Build a Prisma `contains` + `mode: insensitive` filter for a given field.
 * Returns `undefined` when the query is empty (easy to spread into `where`).
 *
 * @example
 *   const where = {
 *     ...textFilter("title", raw),
 *   };
 */
export function textFilter(field: string, raw: string) {
  const q = normalizeText(raw);
  if (!q) return undefined;
  return { [field]: { contains: q, mode: "insensitive" as const } };
}
