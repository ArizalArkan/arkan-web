// Keyboard -> actions (ARCHITECTURE.md §4.5, UX-GUIDELINES.md §8.2).
// Plain DOM, no React, so it can be unit tested and read from useFrame.

export type InputAction = 'interact' | 'cancel' | 'fastTravel' | 'questLog';

const MOVE_KEYS: Record<string, readonly [number, number]> = {
  KeyW: [0, -1],
  ArrowUp: [0, -1],
  KeyS: [0, 1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

const ACTION_KEYS: Record<string, InputAction> = {
  KeyE: 'interact',
  Enter: 'interact',
  Space: 'interact',
  Escape: 'cancel',
  KeyM: 'fastTravel',
  KeyQ: 'questLog',
};

/** Shortcuts stay out of the way while someone is typing or using a control. */
export const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
};

const isControlTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && /^(BUTTON|A|SUMMARY)$/.test(target.tagName);

type Options = {
  target?: Window;
  /** False while a window or dialog covers the town. */
  isEnabled: () => boolean;
  onAction: (action: InputAction) => void;
  onMoveKey?: () => void;
};

export const createKeyboardInput = ({
  target = window,
  isEnabled,
  onAction,
  onMoveKey,
}: Options) => {
  const held = new Set<string>();
  const direction = { x: 0, z: 0 };

  const recompute = () => {
    let x = 0;
    let z = 0;
    for (const code of held) {
      const move = MOVE_KEYS[code];
      if (move) {
        x += move[0];
        z += move[1];
      }
    }
    direction.x = Math.sign(x);
    direction.z = Math.sign(z);
  };

  const release = () => {
    held.clear();
    recompute();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    // A dialog or window already handled this key (e.g. Esc closing it).
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;
    if (!isEnabled()) return;

    if (MOVE_KEYS[event.code]) {
      held.add(event.code);
      recompute();
      onMoveKey?.();
      event.preventDefault(); // arrows must not scroll the page behind the canvas
      return;
    }
    const action = ACTION_KEYS[event.code];
    if (!action || event.repeat) return;
    // Enter and Space on a focused button belong to that button.
    if (action === 'interact' && event.code !== 'KeyE' && isControlTarget(event.target)) return;
    event.preventDefault();
    onAction(action);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (held.delete(event.code)) recompute();
  };

  // Holding a key, switching tab and coming back must not leave the hero
  // walking on his own (QA-CHECKLIST §5.1).
  const onVisibility = () => {
    if (document.hidden) release();
  };

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);
  target.addEventListener('blur', release);
  document.addEventListener('visibilitychange', onVisibility);

  return {
    /** Live direction, each axis -1, 0 or 1. Zero while disabled. */
    direction() {
      if (!isEnabled() && held.size > 0) release();
      return direction;
    },
    dispose() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
};
