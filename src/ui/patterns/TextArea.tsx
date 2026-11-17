import type { ComponentProps } from 'react';
import { copy, fill } from '@/content/copy';
import { cn } from '@/lib/cn';
import { inputClass } from './inputClass';

type TextAreaProps = ComponentProps<'textarea'> & {
  /** Shows "132 / 2000"; turns error-red past the limit. */
  maxCount?: number;
};

export function TextArea({ className, maxCount, value, ...rest }: TextAreaProps) {
  const count = typeof value === 'string' ? value.length : 0;
  const isOver = maxCount !== undefined && count > maxCount;
  return (
    <div className="flex flex-col gap-1">
      <textarea
        className={cn(inputClass, 'min-h-36 resize-y', className)}
        value={value}
        {...rest}
      />
      {maxCount !== undefined ? (
        <p
          className={cn(
            'self-end font-ui text-ui-sm tabular-nums',
            isOver ? 'text-hp-300' : 'text-dusk-300',
          )}
          aria-label={fill(copy.a11y.characterCount, { count, max: maxCount })}
        >
          {count} / {maxCount}
        </p>
      ) : null}
    </div>
  );
}
