import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type DividerProps = ComponentProps<'div'> & { ornament?: boolean };

/** Decorative dusk-500 rule with an optional diamond in the middle. */
export function Divider({ ornament = false, className, ...rest }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn('flex items-center gap-2 text-dusk-500', className)}
      {...rest}
    >
      <span className="h-px flex-1 bg-current" />
      {ornament ? <span className="size-2 rotate-45 bg-current" aria-hidden="true" /> : null}
      {ornament ? <span className="h-px flex-1 bg-current" /> : null}
    </div>
  );
}
