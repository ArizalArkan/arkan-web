import { useEffect } from 'react';
import { world } from '@/content/world';
import { applyRoute, routeFromUi, SECTION_LOCATION } from '@/game/routing';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { useUIStore } from '@/game/stores/useUIStore';
import { formatRoute, parseRoute, sameRoute } from '@/lib/route';

// Two-way sync between the hash and the open window (ARCHITECTURE.md §7).
// Opening a window pushes a history entry, so the browser Back button closes
// it; Forward opens it again.

type HistoryState = { arkanWindow?: true } | null;

export function useAdventureRoute() {
  useEffect(() => {
    // Deep link on arrival: place the hero at the right building, then open it.
    const initial = parseRoute(window.location.hash);
    if (initial.kind !== 'home') {
      const section = initial.kind === 'section' ? initial.section : 'quests';
      const locationId = SECTION_LOCATION[section];
      if (world.locations.some((location) => location.id === locationId)) {
        usePlayerStore.getState().requestTravel(locationId, false);
      }
      applyRoute(initial);
    }

    let isApplyingUrl = false;

    const onHashChange = () => {
      const route = parseRoute(window.location.hash);
      const ui = useUIStore.getState();
      if (sameRoute(route, routeFromUi(ui.window, ui.questId))) return;
      isApplyingUrl = true;
      applyRoute(route);
      isApplyingUrl = false;
    };

    const unsubscribe = useUIStore.subscribe((state, previous) => {
      if (state.window === previous.window && state.questId === previous.questId) return;
      if (isApplyingUrl) return;
      const next = routeFromUi(state.window, state.questId);
      const current = parseRoute(window.location.hash);
      if (sameRoute(next, current)) return;

      if (next.kind === 'home') {
        // Closing a window we pushed: step back so Forward can reopen it.
        if ((window.history.state as HistoryState)?.arkanWindow) window.history.back();
        else
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        return;
      }
      // Quest list -> detail and back stay one entry each, like pages.
      const entry: HistoryState = { arkanWindow: true };
      window.history.pushState(entry, '', formatRoute(next));
    });

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
    };
  }, []);
}
