'use client';

import React from 'react';
import * as Icons from '../icons';

type IconMap = typeof Icons;
export type IconName = keyof IconMap;

export interface ArtIconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
}

const ArtIcon: React.FC<ArtIconProps> = ({ name, size = 16, className, ...rest }) => {
  const Icon = (Icons as IconMap)[name] as React.FC<React.SVGProps<SVGSVGElement>> | undefined;
  if (!Icon) return null;

  const sizeProp = typeof size === 'number' ? `${size}` : size;

  return (
    <Icon
      width={sizeProp}
      height={sizeProp}
      className={className}
      role="presentation"
      aria-hidden={true}
      {...rest}
    />
  );
};

ArtIcon.displayName = 'ArtIcon';

export default ArtIcon;
export { ArtIcon };
