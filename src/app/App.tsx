import { lazy, Suspense, useEffect, useState } from 'react';
import { copy } from '@/content/copy';
import { selectReducedMotion, useSettingsStore } from '@/game/stores/useSettingsStore';
import { useUIStore } from '@/game/stores/useUIStore';
import { ReducedMotionProvider, usePrefersReducedMotion } from '@/lib/motion';
import { analytics } from '@/services/analytics';
import { saveService } from '@/services/save';
import { SceneTransition } from '@/ui/patterns/SceneTransition';
import { TitleScreen } from '@/ui/screens/TitleScreen';
import { hasWebgl, loadAdventure } from './boot';
import { useMusicLifecycle } from './useMusicLifecycle';

const AdventureApp = lazy(() => import('./AdventureApp'));
const QuickReadApp = lazy(() => import('./QuickReadApp'));
const ComponentCatalog = lazy(() => import('./ComponentCatalog'));

const SLOW_MS = 8_000;
const FAIL_MS = 20_000;

type Stage = 'title' | 'playing';
type LoadPhase = 'loading' | 'slow' | 'failed' | 'ready';

/** Picks the mode, runs the boot sequence, and swaps modes without a reload. */
export function App() {
  const mode = useSettingsStore((state) => state.mode);
  const systemReduced = usePrefersReducedMotion();
  const reducedMotion = useSettingsStore(selectReducedMotion);
  const [stage, setStage] = useState<Stage>('title');
  const [phase, setPhase] = useState<LoadPhase>('loading');
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const canAdventure = hasWebgl();

  useMusicLifecycle();

  // OS preference feeds the setting; a manual override still wins.
  useEffect(() => {
    useSettingsStore.getState().setSystemReducedMotion(systemReduced);
  }, [systemReduced]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
  }, [reducedMotion]);

  // Tell the visitor once if their browser will not keep progress.
  useEffect(() => {
    if (!saveService.isAvailable) {
      useUIStore.getState().pushToast({ kind: 'info', title: copy.toasts.saveUnavailable });
    }
  }, []);

  // Load the town behind the title screen. Progress only moves forward.
  useEffect(() => {
    if (mode !== 'adventure' || stage !== 'title') return undefined;
    let isCancelled = false;
    setPhase('loading');
    const slow = window.setTimeout(() => !isCancelled && setPhase('slow'), SLOW_MS);
    const fail = window.setTimeout(() => !isCancelled && setPhase('failed'), FAIL_MS);
    loadAdventure((value) => !isCancelled && setProgress((current) => Math.max(current, value)))
      .then(() => {
        if (isCancelled) return;
        window.clearTimeout(slow);
        window.clearTimeout(fail);
        setPhase('ready');
      })
      .catch((error: unknown) => {
        console.error(error);
        if (isCancelled) return;
        window.clearTimeout(slow);
        window.clearTimeout(fail);
        setPhase('failed');
      });
    return () => {
      isCancelled = true;
      window.clearTimeout(slow);
      window.clearTimeout(fail);
    };
  }, [mode, stage, attempt]);

  if (new URLSearchParams(window.location.search).has('catalog')) {
    return (
      <ReducedMotionProvider value={reducedMotion}>
        <Suspense fallback={null}>
          <ComponentCatalog />
        </Suspense>
      </ReducedMotionProvider>
    );
  }

  const toQuickRead = () => {
    analytics.track('mode_selected', { mode: 'quick' });
    useSettingsStore.getState().setMode('quick');
  };

  if (mode === 'quick' || !canAdventure) {
    return (
      <ReducedMotionProvider value={reducedMotion}>
        <Suspense fallback={<Fallback />}>
          <QuickReadApp
            canAdventure={canAdventure}
            notice={canAdventure ? null : copy.errors.noWebgl}
          />
        </Suspense>
      </ReducedMotionProvider>
    );
  }

  return (
    <ReducedMotionProvider value={reducedMotion}>
      {stage === 'title' ? (
        <TitleScreen
          phase={phase}
          progress={progress}
          onStart={() => {
            analytics.track('mode_selected', { mode: 'adventure' });
            setIsStarting(true);
          }}
          onQuickRead={toQuickRead}
          onRetry={() => {
            setProgress(0);
            setAttempt((value) => value + 1);
          }}
        />
      ) : (
        <Suspense fallback={<Fallback />}>
          <AdventureApp />
        </Suspense>
      )}
      <SceneTransition
        kind="iris"
        isActive={isStarting}
        onMidpoint={() => setStage('playing')}
        onDone={() => setIsStarting(false)}
      />
    </ReducedMotionProvider>
  );
}

function Fallback() {
  return <div className="min-h-dvh bg-night-900" aria-busy="true" />;
}
