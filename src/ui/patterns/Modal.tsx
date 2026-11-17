import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { copy } from '@/content/copy';
import { cn } from '@/lib/cn';
import { Icon } from '../primitives/Icon';
import { PixelFrame } from '../primitives/PixelFrame';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  /** Esc and backdrop click close it. */
  dismissible?: boolean;
  /** Element to focus first; defaults to the dialog itself. */
  initialFocus?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
};

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-read' } as const;

/**
 * Native <dialog> modal (COMPONENTS.md §3.3). showModal() makes the rest of
 * the page inert, which traps focus; focus returns to the opener on close.
 */
export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  dismissible = true,
  initialFocus,
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal?.();
      if (!dialog.showModal) dialog.setAttribute('open', '');
      (initialFocus?.current ?? dialog).focus();
    } else if (!open && dialog.open) {
      dialog.close?.();
      if (!dialog.close) dialog.removeAttribute('open');
      openerRef.current?.focus();
    }
  }, [open, initialFocus]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-testid="modal"
      onCancel={(event) => {
        // Esc: we decide, not the browser.
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === dialogRef.current) onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-2*var(--px)*4)] bg-transparent p-0 text-parchment-100 backdrop:bg-night-900/70',
        sizes[size],
        className,
      )}
    >
      {open ? (
        <PixelFrame padding="lg" className="window-open">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-ui text-ui-lg font-semibold">
              {title}
            </h2>
            {dismissible ? (
              <button
                type="button"
                onClick={onClose}
                aria-label={copy.actions.close}
                className="touch-target -m-2 inline-flex items-center justify-center text-parchment-100 hover:text-gold-400"
              >
                <Icon name="close" />
              </button>
            ) : null}
          </div>
          {children}
        </PixelFrame>
      ) : null}
    </dialog>
  );
}
