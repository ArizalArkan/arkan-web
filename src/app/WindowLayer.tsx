import { copy } from '@/content/copy';
import { useUIStore } from '@/game/stores/useUIStore';
import { ErrorState } from '@/ui/patterns/ErrorState';
import { Window } from '@/ui/patterns/Window';
import { PixelButton } from '@/ui/primitives/PixelButton';
import { FastTravelMenu } from '@/ui/screens/FastTravelMenu';
import { LocationWindow } from '@/ui/screens/LocationWindow';
import { isLocationWindow } from '@/ui/screens/locationWindows';
import { QuestLogWindow } from '@/ui/screens/QuestLogWindow';
import { SettingsWindow } from '@/ui/screens/SettingsWindow';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * The one open window (COMPONENTS.md §3.4), each behind its own error
 * boundary so a crash closes only that window, never the town.
 */
export function WindowLayer() {
  const windowId = useUIStore((state) => state.window);
  const closeWindow = useUIStore((state) => state.closeWindow);
  if (!windowId) return null;

  return (
    <ErrorBoundary
      key={windowId}
      fallback={() => (
        <Window id="error" title={copy.errors.crashTitle} icon="alert" onClose={closeWindow}>
          <ErrorState
            illustration="alert"
            title={copy.errors.crashTitle}
            description={copy.errors.crashBody}
          >
            <div className="flex flex-wrap justify-center gap-3">
              <PixelButton variant="secondary" onClick={closeWindow}>
                {copy.actions.close}
              </PixelButton>
              <PixelButton onClick={() => window.location.reload()}>
                {copy.actions.reload}
              </PixelButton>
            </div>
          </ErrorState>
        </Window>
      )}
    >
      {isLocationWindow(windowId) ? <LocationWindow id={windowId} /> : null}
      {windowId === 'fast-travel' ? <FastTravelMenu /> : null}
      {windowId === 'quest-log' ? <QuestLogWindow /> : null}
      {windowId === 'settings' ? <SettingsWindow /> : null}
    </ErrorBoundary>
  );
}
