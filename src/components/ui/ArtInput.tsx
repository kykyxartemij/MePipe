'use client';

import React, { forwardRef, useRef, useState } from 'react';
import { ArtIcon, ArtIconProps } from './ArtIcon';

interface ArtInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ArtIconProps;
  clearable?: boolean;
  helperText?: string;
}

const ArtInput = forwardRef<HTMLInputElement, ArtInputProps>((props, ref) => {
  const { className, placeholder, icon, clearable, helperText, onChange, ...rest } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hasValue, setHasValue] = useState(false);

  const setRef = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (!ref) return;
    typeof ref === 'function' ? ref(el) : (ref.current = el);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    onChange?.(e);
  };

  const handleClear = () => {
    const el = inputRef.current;
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    setHasValue(false);
  };

  const placeholderStr = placeholder !== undefined ? String(placeholder) : undefined;
  const showClear = clearable && hasValue;

  return (
    <div className="art-input-wrapper">
      <div className="art-input-inner">
        {icon && (
          <span className="art-input-icon art-input-icon--left" aria-hidden>
            <ArtIcon {...icon} />
          </span>
        )}
        <input
          {...rest}
          ref={setRef}
          placeholder={placeholderStr}
          className={`art-input ${className || ''}`}
          onChange={handleChange}
          style={{
            paddingLeft: icon ? '2.25rem' : undefined,
            paddingRight: showClear ? '2.25rem' : undefined,
          }}
        />
        {showClear && (
          <button
            type="button"
            className="art-input-clear"
            onClick={handleClear}
            aria-label="Clear"
            tabIndex={-1}
          >
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
