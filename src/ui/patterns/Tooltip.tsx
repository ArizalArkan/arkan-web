import { useId, useRef, useState, type ReactElement } from 'react';
import { cn } from '@/lib/cn';

type TooltipProps = {
  label: string;
  /** The trigger already carries its own aria-label; the tooltip is visual only. */
  children: ReactElement;
  side?: 'top' | 'bottom';
  className?: string;
};

const DELAY_MS = 300;

/**
 * Hover/focus label for HUD icon buttons (COMPONENTS.md §3.8). Never the only
 * source of information, and hidden on touch-only devices.
 */
export function Tooltip({ label, children, side = 'bottom', className }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const id = useId();

  const show = (delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIsOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setIsOpen(false);
  };

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={(event) => event.pointerType === 'mouse' && show(DELAY_MS)}
      onPointerLeave={hide}
      onFocus={() => show(0)}
      onBlur={hide}
      onKeyDown={(event) => event.key === 'Escape' && hide()}
    >
      {children}
      {isOpen ? (
        <span
          id={id}
          aria-hidden="true"
          className={cn(
            'stair pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 bg-parchment-100 px-2 py-1 font-ui text-ui-sm font-semibold whitespace-nowrap text-ink-900 [@media(hover:none)]:hidden',
            side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
            className,
          )}
          style={{ clipPath: 'var(--stair)' }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
