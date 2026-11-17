import { useEffect } from 'react';
import { world } from '@/content/world';
import { openLocation } from '@/game/actions';
import { teleportBody } from '@/game/navigation/movement';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { cameraState, heroBody } from './heroState';

/**
 * Fast Travel. The UI covers the screen, then commits; at that moment the
 * hero is placed at the door, the camera snaps, and the window opens.
 */
export function useTravelSystem() {
  useEffect(
    () =>
      usePlayerStore.subscribe((state, previous) => {
        const travel = state.travel;
        if (!travel?.isCommitted || previous.travel?.isCommitted) return;
        const location = world.locations.find((entry) => entry.id === travel.locationId);
        if (!location) return;
        teleportBody(heroBody, location.door[0], location.door[2], 'up');
        cameraState.snap = true;
        if (travel.openOnArrival) openLocation(location.id);
      }),
    [],
  );
}
