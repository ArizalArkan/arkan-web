import { useRef } from 'react';
import { copy } from '@/content/copy';
import { PixelButton } from '../primitives/PixelButton';
import { Modal } from './Modal';

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
};

/**
 * Confirmation for destructive actions (COMPONENTS.md §3.3, UX §7):
 * Cancel on the left and focused first, the specific action on the right.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = copy.actions.cancel,
  tone = 'default',
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" initialFocus={cancelRef}>
      <p className="font-body text-body-md text-parchment-100">{message}</p>
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <PixelButton ref={cancelRef} variant="secondary" sfx="cancel" onClick={onClose}>
          {cancelLabel}
        </PixelButton>
        <PixelButton
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </PixelButton>
      </div>
    </Modal>
  );
}
