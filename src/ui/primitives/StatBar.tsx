import type { ComponentProps } from 'react';
import { copy, fill } from '@/content/copy';
import { cn } from '@/lib/cn';

type Kind = 'hp' | 'mp' | 'xp';

type StatBarProps = Omit<ComponentProps<'div'>, 'children'> & {
  kind?: Kind;
  value: number;
  max: number;
  /** Accessible name, e.g. "XP". Read as "XP 150 of 300". */
  label: string;
  showValue?: boolean;
};

const fills: Record<Kind, string> = {
  hp: 'bg-hp-500',
  mp: 'bg-mana-400',
  xp: 'bg-gold-400',
};

const SEGMENTS = 20;

/** Segmented bar (COMPONENTS.md §2.6). Fills in whole segments, never fractions. */
export function StatBar({
  kind = 'xp',
  value,
  max,
  label,
  showValue = true,
  className,
  ...rest
}: StatBarProps) {
  const safeMax = Math.max(1, max);
  const clamped = Math.min(Math.max(0, value), safeMax);
  const filled = Math.round((clamped / safeMax) * SEGMENTS);
  const isFull = filled === SEGMENTS;

  return (
    <div className={cn('flex items-center gap-2', className)} {...rest}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-valuetext={fill(copy.a11y.valueOf, { label, value: clamped, max: safeMax })}
        className="flex h-3 min-w-24 flex-1 gap-px bg-night-900 p-px"
      >
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-full flex-1 transition-colors duration-(--motion-fast) ease-pixel',
              index < filled ? fills[kind] : 'bg-night-700',
              isFull && index === SEGMENTS - 1 && 'bg-parchment-100',
            )}
          />
        ))}
      </div>
      {showValue ? (
        <span className="pixel-text font-display text-display-sm text-parchment-100 tabular-nums">
          {clamped}/{safeMax}
        </span>
      ) : null}
    </div>
  );
}
