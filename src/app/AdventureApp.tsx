import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { copy } from '@/content/copy';
import { world as worldContent } from '@/content/world';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { selectReducedMotion, selectTier, useSettingsStore } from '@/game/stores/useSettingsStore';
import { useUIStore } from '@/game/stores/useUIStore';
import { ReducedMotionProvider } from '@/lib/motion';
import { ControlHints } from '@/ui/hud/ControlHints';
import { DialogLayer } from '@/ui/hud/DialogLayer';
import { SceneTransition } from '@/ui/patterns/SceneTransition';
import { ToastViewport } from '@/ui/patterns/ToastViewport';
import { Window } from '@/ui/patterns/Window';
import { camera as cameraTheme, maxDpr } from '@/world/theme';
import { World } from '@/world/World';

const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

/** Adventure Mode: the 3D town on a fixed canvas, with the DOM HUD on top. */
export default function AdventureApp() {
  const tier = useSettingsStore(selectTier);
  const reducedMotion = useSettingsStore(selectReducedMotion);
  const travel = usePlayerStore((state) => state.travel);
  const toasts = useUIStore((state) => state.toasts);
  const dismissToast = useUIStore((state) => state.dismissToast);
  const [isHidden, setIsHidden] = useState(() => document.hidden);

  // Stop rendering while the tab is in the background (ARCHITECTURE.md §10.2).
  useEffect(() => {
    const onVisibility = () => setIsHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <ReducedMotionProvider value={reducedMotion}>
      <div className="fixed inset-0 touch-none select-none">
        <Canvas
          dpr={[1, isCoarsePointer() ? maxDpr.mobile : maxDpr.desktop]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          camera={{ fov: cameraTheme.fov, near: cameraTheme.near, far: cameraTheme.far }}
          frameloop={isHidden ? 'never' : 'always'}
          shadows={tier !== 'low'}
          aria-label={copy.title.canvasLabel}
          role="img"
        >
          <Suspense fallback={null}>
            <World />
          </Suspense>
        </Canvas>
      </div>

      <ControlHints />
      <DialogLayer />
      <PlaceholderWindow />
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <SceneTransition
        kind="iris"
        isActive={travel !== null}
        onMidpoint={() => usePlayerStore.getState().commitTravel()}
        onDone={() => {
          usePlayerStore.getState().finishTravel();
          usePlayerStore.getState().setTransitioning(false);
        }}
      />
    </ReducedMotionProvider>
  );
}

// Stand-in until Phase 7 builds the real location windows. It proves the
// interaction path end to end: walk up, interact, window opens, Esc closes.
function PlaceholderWindow() {
  const windowId = useUIStore((state) => state.window);
  const closeWindow = useUIStore((state) => state.closeWindow);
  if (!windowId) return null;
  const location = worldContent.locations.find((entry) => entry.window === windowId);
  return (
    <Window
      id={windowId}
      title={location?.name ?? windowId}
      subtitle={location?.literal}
      icon="scroll"
      onClose={closeWindow}
    >
      <p className="font-body text-body-md">TODO(phase 7): the real window content goes here.</p>
    </Window>
  );
}
