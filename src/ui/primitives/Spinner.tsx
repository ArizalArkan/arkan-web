import type { ComponentProps } from 'react';
import { copy } from '@/content/copy';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

type SpinnerProps = ComponentProps<'span'> & { label?: string };

/** Four-step rotating gem (COMPONENTS.md §2.9); stepped, never smooth. */
export function Spinner({ label = copy.a11y.loading, className, ...rest }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2', className)} {...rest}>
      <span className="spinner-frames inline-flex text-gold-400">
        <Icon name="gem" size={2} />
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
