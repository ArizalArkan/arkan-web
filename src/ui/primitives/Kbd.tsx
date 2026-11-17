import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Pixel keycap (COMPONENTS.md §2.8). */
export function Kbd({ className, ...rest }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'stair inline-flex min-w-7 items-center justify-center bg-parchment-100 px-2 pb-0.5 font-ui text-ui-sm font-semibold text-ink-900 shadow-[inset_0_calc(-0.5*var(--px))_0_var(--color-parchment-300)] [--step:calc(var(--px)*0.5)]',
        className,
      )}
      style={{ clipPath: 'var(--stair)' }}
      {...rest}
    />
  );
}
