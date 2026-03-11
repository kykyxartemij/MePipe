'use client';

import React, { forwardRef } from 'react';

interface ArtTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  helperText?: string;
}

/**
 * ArtTextarea -- uses the exact same `art-field` styling as ArtInput.
 * The only difference is <textarea> instead of <input> + vertical resize.
 */
const ArtTextarea = forwardRef<HTMLTextAreaElement, ArtTextareaProps>((props, ref) => {
  const { className, helperText, ...rest } = props;

  return (
    <div className="art-field-wrapper">
      <div className="art-field-inner">
        <textarea {...rest} ref={ref} className={`art-field resize-y ${className || ''}`} />
      </div>
      {helperText && <p className="art-field-helper">{helperText}</p>}
    </div>
  );
});

ArtTextarea.displayName = 'ArtTextarea';

export default ArtTextarea;
export { ArtTextarea };
