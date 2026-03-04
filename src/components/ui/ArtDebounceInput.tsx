"use client";

import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import debounce from "lodash.debounce";
import ArtInput from "./ArtInput";

interface ArtDebounceInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
}

const ArtDebounceInput = forwardRef<HTMLInputElement, ArtDebounceInputProps>(
  ({ debounceMs = 300, onChange, onDebouncedChange, ...rest }, ref) => {
    const debouncedRef = useRef(onDebouncedChange);

    useEffect(() => {
      debouncedRef.current = onDebouncedChange;
    }, [onDebouncedChange]);

    const debounced = useMemo(
      () =>
        debounce((value: string) => {
          debouncedRef.current?.(value);
        }, debounceMs),
      [debounceMs]
    );

    useEffect(() => {
      return () => debounced.cancel?.();
    }, [debounced]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      debounced(e.target.value);
    };

    return <ArtInput {...rest} ref={ref} onChange={handleChange} />;
  }
);

ArtDebounceInput.displayName = "ArtDebounceInput";

export default ArtDebounceInput;
export { ArtDebounceInput };
