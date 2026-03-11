'use client';

import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArtIcon, ArtIconProps } from './ArtIcon';

interface ArtInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ArtIconProps;
  clearable?: boolean;
  helperText?: string;
  /** false = no debounce (default), number = debounce in ms */
  debounce?: false | number;
  /** Fires after `debounce` ms of inactivity. Only used when debounce > 0 */
  onDebouncedChange?: (value: string) => void;
}

const ArtInput = forwardRef<HTMLInputElement, ArtInputProps>((props, ref) => {
  const {
    className,
    icon,
    clearable,
    helperText,
    debounce: debounceMs = false,
    onDebouncedChange,
    onChange,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hasValue, setHasValue] = useState(false);

  // ---- ref forwarding ----
  const setRef = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (!ref) return;
    typeof ref === 'function' ? ref(el) : (ref.current = el);
  };

  // ---- debounce ----
  const debouncedRef = useRef(onDebouncedChange);
  useEffect(() => {
    debouncedRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  const debounced = useMemo(() => {
    if (!debounceMs) return null;
    let timer: ReturnType<typeof setTimeout>;
    const fn = (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => debouncedRef.current?.(value), debounceMs);
    };
    fn.cancel = () => clearTimeout(timer);
    return fn;
  }, [debounceMs]);

  useEffect(() => {
    return () => debounced?.cancel();
  }, [debounced]);

  // ---- handlers ----
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      onChange?.(e);
      debounced?.(e.target.value);
    },
    [onChange, debounced],
  );

  const handleClear = () => {
    const el = inputRef.current;
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    setHasValue(false);
  };

  const showClear = clearable && hasValue;

  return (
    <div className="art-field-wrapper">
      <div className="art-field-inner">
        {icon && (
          <span className="art-field-icon" aria-hidden>
            <ArtIcon {...icon} />
          </span>
        )}
        <input
          {...rest}
          ref={setRef}
          className={`art-field ${className || ''}`}
          onChange={handleChange}
        />
        {showClear && (
          <button type="button" className="art-field-clear" onClick={handleClear} aria-label="Clear" tabIndex={-1}>
            <ArtIcon name="Close" size={14} />
          </button>
        )}
      </div>
      {helperText && <p className="art-field-helper">{helperText}</p>}
    </div>
  );
});

ArtInput.displayName = 'ArtInput';

export default ArtInput;
export { ArtInput };
export type { ArtInputProps };
