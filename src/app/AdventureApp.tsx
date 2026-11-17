import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { copy } from '@/content/copy';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { selectTier, useSettingsStore } from '@/game/stores/useSettingsStore';
import { useUIStore } from '@/game/stores/useUIStore';
import { audio } from '@/services/audio';
import { ControlHints } from '@/ui/hud/ControlHints';
import { DialogLayer } from '@/ui/hud/DialogLayer';
import { Hud } from '@/ui/hud/Hud';
import { LocationBanner } from '@/ui/hud/LocationBanner';
import { ErrorState } from '@/ui/patterns/ErrorState';
import { SceneTransition } from '@/ui/patterns/SceneTransition';
import { ToastViewport } from '@/ui/patterns/ToastViewport';
import { PixelButton } from '@/ui/primitives/PixelButton';
import { PixelFrame } from '@/ui/primitives/PixelFrame';
import { Effects } from '@/world/effects/Effects';
import { qa } from '@/world/qa';
import { camera as cameraTheme, maxDpr } from '@/world/theme';
import { World } from '@/world/World';
import { useAdventureRoute } from './useAdventureRoute';
import { useGreeting } from './useGreeting';
import { WindowLayer } from './WindowLayer';

const isCoarsePointer = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(pointer: coarse)').matches);

/** How long a lost GL context gets to come back before we offer a reload. */
const RESTORE_GRACE_MS = 5000;

type GlState = 'ok' | 'lost' | 'dead';

/** Adventure Mode: the 3D town on a fixed canvas, with the DOM HUD on top. */
export default function AdventureApp() {
  const storeTier = useSettingsStore(selectTier);
  const tier = qa.tier ?? storeTier;
  const travel = usePlayerStore((state) => state.travel);
  const toasts = useUIStore((state) => state.toasts);
  const dismissToast = useUIStore((state) => state.dismissToast);
  const hasWindow = useUIStore((state) => state.window !== null);
  const [isHidden, setIsHidden] = useState(() => document.hidden);
  const [glState, setGlState] = useState<GlState>('ok');

  useAdventureRoute();
  useGreeting();

  // Auto quality: step down when frames drop, back up when there is headroom.
  // A manual choice in Settings always wins (selectTier ignores autoTier then).
  const onDecline = () => {
    const settings = useSettingsStore.getState();
    if (settings.quality === 'auto' && settings.lowerAutoTier()) {
      useUIStore.getState().pushToast({ kind: 'info', title: copy.toasts.qualityLowered });
    }
  };
  const onIncline = () => {
    const settings = useSettingsStore.getState();
    if (settings.quality === 'auto') settings.raiseAutoTier();
  };

  // Stop rendering and sound while the tab is in the background (ARCHITECTURE.md §10.2).
  useEffect(() => {
    const onVisibility = () => {
      setIsHidden(document.hidden);
      if (document.hidden) audio.pause();
      else audio.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (glState !== 'lost') return undefined;
    const timer = window.setTimeout(() => setGlState('dead'), RESTORE_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [glState]);

  // Audio may only start after a real gesture (iOS); the first one unlocks it.
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <>
      <a
        href="?mode=quick"
        onClick={(event) => {
          event.preventDefault();
          useSettingsStore.getState().setMode('quick');
        }}
        className="sr-only z-50 bg-gold-400 px-4 py-2 font-ui font-semibold text-ink-900 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {copy.title.skipLink}
      </a>

      <main className="fixed inset-0 touch-none select-none" aria-label={copy.modes.adventure}>
        <h1 className="sr-only">{copy.modes.adventure}</h1>
        <Canvas
          dpr={[1, isCoarsePointer() ? maxDpr.mobile : maxDpr.desktop]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          camera={{ fov: cameraTheme.fov, near: cameraTheme.near, far: cameraTheme.far }}
          // Paused only in the background: the town stays visible, dimmed, behind windows.
          frameloop={isHidden || glState !== 'ok' ? 'never' : 'always'}
          shadows={tier !== 'low'}
          aria-label={copy.title.canvasLabel}
          role="img"
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.addEventListener('webglcontextlost', (event) => {
              event.preventDefault(); // lets the browser restore it
              setGlState('lost');
            });
            canvas.addEventListener('webglcontextrestored', () => setGlState('ok'));
          }}
        >
          <PerformanceMonitor onDecline={onDecline} onIncline={onIncline} flipflops={3} />
          <Suspense fallback={null}>
            <World />
            <Effects tier={tier} />
          </Suspense>
        </Canvas>
      </main>

      <Hud />
      <LocationBanner />
      <ControlHints />
      <DialogLayer />
      <WindowLayer />
      <ToastViewport
        toasts={toasts}
        onDismiss={dismissToast}
        placement={hasWindow ? 'bottom' : 'top'}
      />

      {glState !== 'ok' ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-night-900/90 p-4">
          <PixelFrame className="max-w-read">
            {glState === 'lost' ? (
              <p role="status" className="font-body text-body-md">
                {copy.errors.contextLost}
              </p>
            ) : (
              <ErrorState
                illustration="alert"
                title={copy.errors.contextLostFailed}
                action={{ label: copy.actions.reload, onClick: () => window.location.reload() }}
              >
                <PixelButton
                  variant="secondary"
                  onClick={() => useSettingsStore.getState().setMode('quick')}
                >
                  {copy.modes.openQuickRead}
                </PixelButton>
              </ErrorState>
            )}
          </PixelFrame>
        </div>
      ) : null}

      <SceneTransition
        kind="iris"
        isActive={travel !== null}
        onMidpoint={() => usePlayerStore.getState().commitTravel()}
        onDone={() => {
          usePlayerStore.getState().finishTravel();
          usePlayerStore.getState().setTransitioning(false);
        }}
      />
    </>
  );
}
