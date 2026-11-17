import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg';

type PortraitProps = Omit<ComponentProps<'img'>, 'width' | 'height'> & {
  src: string;
  alt: string;
  size?: Size;
  /** Source aspect ratio (width / height); the box keeps it, height fixed. */
  aspect?: number;
  frame?: boolean;
};

const heights: Record<Size, number> = { sm: 32, md: 64, lg: 96 };

/** Integer-scaled portrait (COMPONENTS.md §2.7). */
export function Portrait({
  src,
  alt,
  size = 'md',
  aspect = 1,
  frame = true,
  className,
  ...rest
}: PortraitProps) {
  const height = heights[size];
  return (
    <img
      src={src}
      alt={alt}
      width={Math.round(height * aspect)}
      height={height}
      loading="lazy"
      decoding="async"
      className={cn(
        'pixelated block object-cover',
        frame && 'outline-2 outline-offset-0 outline-parchment-300',
        className,
      )}
      {...rest}
    />
  );
}
