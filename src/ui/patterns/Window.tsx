import {
  useId,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { copy } from '@/content/copy';
import { cn } from '@/lib/cn';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/iconData';
import { PixelFrame } from '../primitives/PixelFrame';

type WindowProps = {
  id: string;
  title: string;
  /** Literal meaning under the themed title, e.g. "About". */
  subtitle?: string;
  icon: IconName;
  variant?: 'window' | 'parchment';
  /** 'read' = 720 px for text, 'grid' = 960 px for the quest grid. */
  width?: 'read' | 'grid';
  onClose: () => void;
  /** Shows the back button (detail pages). */
  onBack?: () => void;
  footer?: ReactNode;
  children: ReactNode;
  /** Scroll container, so screens can remember scroll position. */
  bodyRef?: Ref<HTMLDivElement>;
};

const SWIPE_CLOSE_PX = 96;

/**
 * Location content window (COMPONENTS.md §3.4). Centered sheet on desktop,
 * bottom sheet (85% height, swipe down to close) on small screens. Focus
 * starts on the title and is trapped inside until it closes.
 */
export function Window({
  id,
  title,
  subtitle,
  icon,
  variant = 'window',
  width = 'read',
  onClose,
  onBack,
  footer,
  children,
  bodyRef,
}: WindowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dragStart = useRef<number | null>(null);
  const titleId = useId();
  useFocusTrap(rootRef, true, titleRef);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const isTyping = target.matches('input, textarea, select, [contenteditable="true"]');
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    } else if (event.key === 'Backspace' && onBack && !isTyping) {
      event.preventDefault();
      onBack();
    }
  };

  // Swipe-down to close, from the header only, so body scrolling never fights it.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') dragStart.current = event.clientY;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current !== null && event.clientY - dragStart.current > SWIPE_CLOSE_PX) onClose();
    dragStart.current = null;
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 flex items-end justify-center bg-night-900/45 md:items-center md:p-8"
      data-testid={`window-${id}`}
    >
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={cn(
          'window-open pointer-events-auto flex max-h-[85dvh] w-full flex-col outline-none md:max-h-[min(85dvh,56rem)]',
          width === 'read' ? 'md:max-w-read' : 'md:max-w-grid',
        )}
      >
        <PixelFrame
          variant={variant}
          padding="none"
          className="flex max-h-full min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]"
        >
          <div
            className="flex items-center gap-2 border-b border-current/20 px-3 py-2"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (dragStart.current = null)}
          >
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={copy.actions.back}
                className="touch-target inline-flex items-center justify-center hover:text-gold-400"
              >
                <Icon name="back" />
              </button>
            ) : (
              <span className="inline-flex size-11 items-center justify-center" aria-hidden="true">
                <Icon name={icon} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2
                ref={titleRef}
                id={titleId}
                tabIndex={-1}
                className="pixel-text truncate font-display text-display-md uppercase outline-none"
              >
                {title}
              </h2>
              {subtitle ? <p className="font-ui text-ui-sm opacity-80">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.actions.close}
              data-testid="window-close"
              className="touch-target inline-flex items-center justify-center hover:text-gold-400"
            >
              <Icon name="close" />
            </button>
          </div>
          <div
            ref={bodyRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6"
          >
            {children}
          </div>
          {footer ? <div className="border-t border-current/20 px-4 py-2">{footer}</div> : null}
        </PixelFrame>
      </div>
    </div>
  );
}
