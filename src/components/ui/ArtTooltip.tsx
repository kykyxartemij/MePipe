'use client';

import { useState, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './art.utils';

interface ArtTooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

const ArtTooltip = ({ label, children, className }: ArtTooltipProps) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({ top: rect.top, left: rect.left + rect.width / 2 });
    }
  };

  return (
    <span
      ref={wrapperRef}
      className={cn('inline-flex', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setCoords(null)}
    >
      {children}
      {coords && createPortal(
        <span
          className="art-tooltip"
          role="tooltip"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            bottom: 'auto',
            transform: 'translate(-50%, calc(-100% - 6px))',
            opacity: 1,
          }}
        >
          {label}
        </span>,
        document.body,
      )}
    </span>
  );
};

ArtTooltip.displayName = 'ArtTooltip';

export default ArtTooltip;
export { ArtTooltip };
