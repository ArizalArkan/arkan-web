import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Text for screen readers only (COMPONENTS.md §2.9). */
export function VisuallyHidden({ className, ...rest }: ComponentProps<'span'>) {
  return <span className={cn('sr-only', className)} {...rest} />;
}
