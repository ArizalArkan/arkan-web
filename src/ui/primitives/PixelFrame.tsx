import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'window' | 'parchment' | 'ghost';
type Padding = 'none' | 'sm' | 'md' | 'lg';

type PixelFrameProps<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  padding?: Padding;
  /** Nameplate on the top-left corner. */
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'title' | 'children' | 'className'>;

const variants: Record<Variant, string> = {
  window: '',
  parchment: 'pf-parchment surface-light',
  ghost: 'pf-ghost',
};

const paddings: Record<Padding, string> = {
  none: 'p-1',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

/** The base JRPG window every UI surface is built from (COMPONENTS.md §2.1). */
export function PixelFrame<T extends ElementType = 'div'>({
  as,
  variant = 'window',
  padding = 'md',
  title,
  className,
  children,
  ...rest
}: PixelFrameProps<T>) {
  const Root: ElementType = as ?? 'div';
  return (
    <Root className={cn('pf', variants[variant], paddings[padding], className)} {...rest}>
      <span className="pf-shadow" aria-hidden="true" />
      <span className="pf-border" aria-hidden="true" />
      <span className="pf-fill" aria-hidden="true" />
      {title ? (
        <div className="pf nameplate absolute -top-4 left-4 px-3 py-1 font-ui text-ui-sm font-semibold">
          <span className="pf-border" aria-hidden="true" />
          <span className="pf-fill" aria-hidden="true" />
          {title}
        </div>
      ) : null}
      {children}
    </Root>
  );
}
