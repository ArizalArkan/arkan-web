import gsap from 'gsap';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { cameraState } from '../systems/heroState';

// Opening shot (PRODUCT.md §5.1): the camera starts high above the town and
// settles into the play view. Well under the 6 s limit, skippable with any
// key, click or tap, and skipped entirely for reduced motion and repeat visits.

const DURATION = 2.6; // seconds
const START_ZOOM = 2.1;
const START_EXTRA_PITCH = 22; // degrees steeper than the play view

/**
 * Plays the intro and returns a function that ends it immediately.
 * World input stays off until it finishes.
 */
export const playIntro = (onDone?: () => void) => {
  const player = usePlayerStore.getState();
  player.setCameraMode('cinematic');
  player.setTransitioning(true);
  cameraState.zoom = START_ZOOM;
  cameraState.extraPitchDeg = START_EXTRA_PITCH;
  cameraState.snap = true;

  let isFinished = false;
  const finish = () => {
    if (isFinished) return;
    isFinished = true;
    tween.kill();
    cameraState.zoom = 1;
    cameraState.extraPitchDeg = 0;
    window.removeEventListener('keydown', finish);
    window.removeEventListener('pointerdown', finish);
    const state = usePlayerStore.getState();
    state.setCameraMode('follow');
    state.setTransitioning(false);
    onDone?.();
  };

  const tween = gsap.to(cameraState, {
    zoom: 1,
    extraPitchDeg: 0,
    duration: DURATION,
    ease: 'power2.inOut',
    onComplete: finish,
  });

  window.addEventListener('keydown', finish);
  window.addEventListener('pointerdown', finish);
  return finish;
};
