import type { GameEvent } from './rules/actions';

// Tiny typed event bus for cross-store side effects (XP -> toast -> SFX)
// without stores importing each other (ARCHITECTURE.md §5.2).

type Listener = (event: GameEvent) => void;

const listeners = new Set<Listener>();

export const events = {
  on(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(event: GameEvent) {
    for (const listener of [...listeners]) listener(event);
  },
  /** Test helper. */
  clear() {
    listeners.clear();
  },
};
