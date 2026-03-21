import { HTMLAttributes } from 'react';
import { cn } from './art.utils';

interface ArtSkeletonProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Reusable skeleton loader using Tailwind classes.
 * Apply the same className as your real element — ArtSkeleton adds shimmer animation.
 *
 * @example
 * // Real element:
 * <img className="w-full h-48 rounded-lg" src="..." />
 *
 * // Loading skeleton:
 * <ArtSkeleton className="w-full h-48 rounded-lg" />
 */
const ArtSkeleton = ({ className, ...rest }: ArtSkeletonProps) => {
  return <div className={cn('shimmer', className)} {...rest} />;
};

ArtSkeleton.displayName = 'ArtSkeleton';
export default ArtSkeleton;
