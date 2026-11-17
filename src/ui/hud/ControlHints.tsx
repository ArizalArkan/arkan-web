import { copy } from '@/content/copy';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { selectIsWorldBlocked, useUIStore } from '@/game/stores/useUIStore';
import { Icon } from '../primitives/Icon';
import { Kbd } from '../primitives/Kbd';
import { PixelButton } from '../primitives/PixelButton';
import { PixelFrame } from '../primitives/PixelFrame';

/**
 * Contextual hint at the bottom of the screen (COMPONENTS.md §5). It follows
 * the last input device: keycaps for keyboard, a large action button for
 * touch and mouse, so the prompt is always something you can act on.
 */
export function ControlHints() {
  const active = usePlayerStore((state) => state.active);
  const device = usePlayerStore((state) => state.inputDevice);
  const requestInteract = usePlayerStore((state) => state.requestInteract);
  const isBlocked = useUIStore(selectIsWorldBlocked);

  if (isBlocked) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center p-2 pb-[max(calc(var(--px)*2),env(safe-area-inset-bottom))] md:p-4"
      data-testid="control-hints"
    >
      {active ? (
        device === 'keyboard' ? (
          <PixelFrame padding="sm" className="flex items-center gap-2 font-ui text-ui-md">
            <Kbd>E</Kbd>
            <span>{active.prompt}</span>
          </PixelFrame>
        ) : (
          <PixelButton
            variant="primary"
            size="lg"
            className="pointer-events-auto"
            onClick={requestInteract}
            data-testid="action-button"
          >
            {active.prompt}
          </PixelButton>
        )
      ) : (
        <PixelFrame
          padding="sm"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-ui text-ui-sm"
        >
          {device === 'keyboard' ? (
            <>
              <span className="flex items-center gap-1.5">
                <Kbd>W</Kbd>
                <Kbd>A</Kbd>
                <Kbd>S</Kbd>
                <Kbd>D</Kbd>
                {copy.hints.move}
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>M</Kbd>
                {copy.fastTravel.title}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <Icon name="forward" />
              {copy.hints.tapToMove}
            </span>
          )}
        </PixelFrame>
      )}
    </div>
  );
}
