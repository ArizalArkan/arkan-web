import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { ICONS, type IconName } from './iconData';

type IconProps = Omit<ComponentProps<'svg'>, 'children'> & {
  name: IconName;
  /** Multiples of 16 px; integer only so pixels stay square (DESIGN.md §5.4). */
  size?: 1 | 2 | 3;
  /** Accessible name. Without it the icon is decorative and hidden. */
  label?: string;
};

const SIZE_PX = { 1: 16, 2: 32, 3: 48 } as const;

// Merge horizontal runs into one rect each: fewer DOM nodes, same pixels.
const runsCache = new Map<IconName, { x: number; y: number; w: number }[]>();
const runsFor = (name: IconName) => {
  const cached = runsCache.get(name);
  if (cached) return cached;
  const runs: { x: number; y: number; w: number }[] = [];
  ICONS[name].forEach((row, y) => {
    let start = -1;
    for (let x = 0; x <= row.length; x += 1) {
      const filled = row[x] === '#';
      if (filled && start < 0) start = x;
      if (!filled && start >= 0) {
        runs.push({ x: start, y, w: x - start });
        start = -1;
      }
    }
  });
  runsCache.set(name, runs);
  return runs;
};

export function Icon({ name, size = 1, label, className, ...rest }: IconProps) {
  const px = SIZE_PX[size];
  return (
    <svg
      viewBox="0 0 16 16"
      width={px}
      height={px}
      shapeRendering="crispEdges"
      fill="currentColor"
      className={cn('inline-block shrink-0', className)}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      focusable="false"
      {...rest}
    >
      {runsFor(name).map(({ x, y, w }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} />
      ))}
    </svg>
  );
}
