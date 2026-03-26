/** Max length for any search/free-text input. */
const MAX_TEXT_LENGTH = 100;

/** Normalise a string: trim whitespace, lowercase, cap at 100 chars. */
export function normalizeText(value: string): string {
  return value.trim().toLowerCase().slice(0, MAX_TEXT_LENGTH);
}
