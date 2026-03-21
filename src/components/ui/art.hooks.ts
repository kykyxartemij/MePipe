'use client';

import { useRef, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Returns a stable debounced caller for `callback`.
 * - `false` / `0` — disabled (calling the returned fn is a no-op)
 * - `true`        — uses DEFAULT_DEBOUNCE_MS (300ms)
 * - `number`      — custom delay in ms
 *
 * The returned function is always stable — no null check needed at call site.
 * Cleanup is handled internally.
 */
export function useArtDebounced(
  callback: ((value: string) => void) | undefined,
  delay: boolean | number,
) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  type DebouncedFn = ReturnType<typeof debounce<(value: string) => void>>;
  const debouncedRef = useRef<DebouncedFn | null>(null);

  useEffect(() => {
    if (!delay) {
      debouncedRef.current = null;
      return;
    }
    const ms = delay === true ? DEFAULT_DEBOUNCE_MS : delay;
    const fn = debounce((value: string) => callbackRef.current?.(value), ms);
    debouncedRef.current = fn;
    return () => {
      fn.cancel();
      debouncedRef.current = null;
    };
  }, [delay]);

  return useCallback((value: string) => debouncedRef.current?.(value), []);
}
