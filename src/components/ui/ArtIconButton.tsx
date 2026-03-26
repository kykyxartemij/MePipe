import { forwardRef } from 'react';
import ArtButton, { type ArtButtonProps } from './ArtButton';
import ArtIcon, { ArtIconName, type ArtIconProps } from './ArtIcon';
import ArtTooltip from './ArtTooltip';
import { type ButtonHTMLAttributes } from 'react';
import { type ArtColor } from './art.types';
import { cn } from './art.utils';

interface ArtIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ArtIconName;
  tooltip?: string;
  size?: ArtButtonProps['size'];
  color?: ArtColor;
  variant?: ArtButtonProps['variant'];
}

const ICON_SIZE: Record<NonNullable<ArtIconButtonProps['size']>, number> = {
  sm: 14, md: 16, lg: 20,
};

const ArtIconButton = forwardRef<HTMLButtonElement, ArtIconButtonProps>(
  ({ icon, tooltip, size = 'md', color, variant = 'ghost', className = '', ...rest }, ref) => {
    const button = (
      <ArtButton
        ref={ref}
        variant={variant}
        size={size}
        color={color}
        aria-label={tooltip}
        className={cn('art-icon-btn', className)}
        {...rest}
      >
        <ArtIcon name={icon} size={ICON_SIZE[size]} />
      </ArtButton>
    );

    if (!tooltip) return button;

    return <ArtTooltip label={tooltip}>{button}</ArtTooltip>;
  },
);

ArtIconButton.displayName = 'ArtIconButton';

export default ArtIconButton;
export { ArtIconButton };
export type { ArtIconButtonProps };
