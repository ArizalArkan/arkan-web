import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/motion';

type SceneTransitionProps = {
  kind?: 'fade' | 'iris';
  isActive: boolean;
  /** Called when the screen is fully covered: swap the scene here. */
  onMidpoint?: () => void;
  onDone?: () => void;
};

const FULL_MS = 600; // motion-scene
const REDUCED_MS = 150;

/**
 * Cover, swap, uncover (COMPONENTS.md §3.10). Under reduced motion it is a
 * 150 ms cross-fade whatever `kind` says.
 */
export function SceneTransition({
  kind = 'fade',
  isActive,
  onMidpoint,
  onDone,
}: SceneTransitionProps) {
  const reducedMotion = useReducedMotion();
  const total = reducedMotion ? REDUCED_MS : FULL_MS;
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');
  const callbacks = useRef({ onMidpoint, onDone });
  callbacks.current = { onMidpoint, onDone };

  useEffect(() => {
    if (!isActive) return undefined;
    setPhase('in');
    const mid = window.setTimeout(() => {
      callbacks.current.onMidpoint?.();
      setPhase('out');
    }, total / 2);
    const end = window.setTimeout(() => {
      setPhase('idle');
      callbacks.current.onDone?.();
    }, total);
    return () => {
      window.clearTimeout(mid);
      window.clearTimeout(end);
    };
  }, [isActive, total]);

  if (phase === 'idle') return null;

  const useIris = kind === 'iris' && !reducedMotion;
  return (
    <div
      aria-hidden="true"
      data-testid="scene-transition"
      className={cn('pointer-events-auto fixed inset-0 z-50 bg-night-900')}
      style={{
        transitionProperty: useIris ? 'clip-path' : 'opacity',
        transitionDuration: `${total / 2}ms`,
        transitionTimingFunction: 'cubic-bezier(.45,0,.55,1)',
        ...(useIris
          ? { clipPath: phase === 'in' ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)' }
          : { opacity: phase === 'in' ? 1 : 0 }),
      }}
    />
  );
}
