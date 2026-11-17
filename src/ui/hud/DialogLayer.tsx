import { dialogs } from '@/content/dialogs';
import { useUIStore } from '@/game/stores/useUIStore';
import { DialogBox } from '../patterns/DialogBox';

/** Shows the open NPC dialog at the bottom of the screen. */
export function DialogLayer() {
  const dialog = useUIStore((state) => state.dialog);
  const closeDialog = useUIStore((state) => state.closeDialog);
  if (!dialog) return null;

  const script = dialogs.find((entry) => entry.id === dialog.dialogId);
  if (!script) return null;
  // A conversation already had is shortened (UX-GUIDELINES.md §9.1).
  const lines = dialog.isRepeat && script.repeatLines ? script.repeatLines : script.lines;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center p-2 pb-[max(calc(var(--px)*2),env(safe-area-inset-bottom))] md:p-6 [@media(max-height:480px)]:max-h-[40dvh]">
      <DialogBox
        // Restart the typewriter when a different script opens.
        key={`${dialog.dialogId}:${dialog.isRepeat}`}
        speaker={{ name: script.speaker }}
        lines={lines}
        onFinish={closeDialog}
        onClose={closeDialog}
        className="max-w-read"
      />
    </div>
  );
}
