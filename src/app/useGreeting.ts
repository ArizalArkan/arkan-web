import { useEffect } from 'react';
import { useGameStore } from '@/game/stores/useGameStore';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { useUIStore } from '@/game/stores/useUIStore';

const IDLE_HINT_MS = 20_000;
const SETTLE_MS = 800;

/**
 * Wren greets the visitor once the intro ends (PRODUCT.md §5.1): the full
 * welcome on a first visit, a short "welcome back" afterwards (§5.4). On a
 * first visit she also nudges once if nothing has happened for 20 s.
 * The greeting itself gives no XP; talking to her on purpose does.
 */
export function useGreeting() {
  useEffect(() => {
    const game = useGameStore.getState();
    const isFirstVisit = game.visited.length === 0 && game.npcsMet.length === 0;
    let idleTimer: number | undefined;

    const greet = () => {
      const ui = useUIStore.getState();
      // A deep link already opened a window: do not talk over it.
      if (ui.window || ui.dialog) return;
      ui.openDialog(isFirstVisit ? 'guide-intro' : 'guide-returning', undefined);
      if (isFirstVisit) {
        idleTimer = window.setTimeout(() => {
          const now = useUIStore.getState();
          const hasActed = useGameStore.getState().visited.length > 0;
          if (!hasActed && !now.window && !now.dialog) now.openDialog('guide-idle-hint');
        }, IDLE_HINT_MS);
      }
    };

    // Give the scene a moment to mount and start its intro, then wait for
    // the intro (or a deep-link transition) to finish before speaking.
    let unsubscribe: (() => void) | undefined;
    const settle = window.setTimeout(() => {
      if (!usePlayerStore.getState().isTransitioning) {
        greet();
        return;
      }
      unsubscribe = usePlayerStore.subscribe((state) => {
        if (state.isTransitioning) return;
        unsubscribe?.();
        unsubscribe = undefined;
        greet();
      });
    }, SETTLE_MS);

    return () => {
      window.clearTimeout(settle);
      unsubscribe?.();
      window.clearTimeout(idleTimer);
    };
  }, []);
}
