import { useEffect, useRef, useState } from 'react';
import { copy } from '@/content/copy';
import { cn } from '@/lib/cn';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/iconData';
import { PixelFrame } from '../primitives/PixelFrame';

export type ToastKind = 'achievement' | 'xp' | 'success' | 'error' | 'info';

export type ToastData = {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
};

const ICONS: Record<ToastKind, IconName> = {
  achievement: 'star',
  xp: 'gem',
  success: 'check',
  error: 'alert',
  info: 'info',
};

const ACCENTS: Record<ToastKind, string> = {
  achievement: 'text-gold-400',
  xp: 'text-gold-400',
  success: 'text-herb-400',
  error: 'text-hp-300',
  info: 'text-mana-400',
};

const durationFor = (kind: ToastKind) => (kind === 'error' ? 8000 : 4000);
const MAX_VISIBLE = 2;

type ToastViewportProps = {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
  className?: string;
};

/** FIFO toast stack, two visible at most (COMPONENTS.md §3.6). */
export function ToastViewport({ toasts, onDismiss, className }: ToastViewportProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-40 flex flex-col items-center gap-2 p-2 pt-[max(calc(var(--px)*2),env(safe-area-inset-top))] md:p-4',
        className,
      )}
    >
      {toasts.slice(0, MAX_VISIBLE).map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const [isPaused, setIsPaused] = useState(false);
  const remaining = useRef(durationFor(toast.kind));

  // Count down only while not hovered or focused, so it never vanishes mid-read.
  useEffect(() => {
    if (isPaused) return undefined;
    const startedAt = performance.now();
    const timer = window.setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= performance.now() - startedAt;
    };
  }, [isPaused, onDismiss, toast.id]);

  const isError = toast.kind === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      data-testid={`toast-${toast.kind}`}
      className="toast-in pointer-events-auto w-full max-w-sm"
    >
      <PixelFrame padding="sm" className="flex items-center gap-3">
        <span className={ACCENTS[toast.kind]}>
          <Icon name={ICONS[toast.kind]} size={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-ui text-ui-md font-semibold">{toast.title}</p>
          {toast.description ? (
            <p className="font-body text-body-sm text-dusk-300">{toast.description}</p>
          ) : null}
        </div>
        {isError ? (
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label={copy.a11y.dismiss}
            className="touch-target inline-flex items-center justify-center hover:text-gold-400"
          >
            <Icon name="close" />
          </button>
        ) : null}
      </PixelFrame>
    </div>
  );
}
