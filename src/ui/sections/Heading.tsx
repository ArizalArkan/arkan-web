import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

import type { HeadingLevel } from './headingLevel';

type HeadingProps = ComponentProps<'h2'> & { level: HeadingLevel };

/** Heading whose level is chosen by the caller, so each mode keeps one h1. */
export function Heading({ level, className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cn(className)} {...rest} />;
}
