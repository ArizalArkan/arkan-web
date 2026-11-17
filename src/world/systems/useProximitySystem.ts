import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { world } from '@/content/world';
import { nearestInteractable, zoneAt } from '@/game/navigation/zones';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { selectIsWorldBlocked, useUIStore } from '@/game/stores/useUIStore';
import { heroBody, interactables } from './heroState';

const TICK = 0.1; // seconds: 10 checks a second is plenty for proximity
const local = { elapsed: TICK };

/**
 * Zone system + interaction system (ARCHITECTURE.md §4.5). Checks what the
 * hero is near ten times a second and writes to the store only on change.
 */
export function useProximitySystem() {
  useFrame((_, delta) => {
    local.elapsed += delta;
    if (local.elapsed < TICK) return;
    local.elapsed = 0;

    const player = usePlayerStore.getState();

    const zone = zoneAt(world, heroBody.x, heroBody.z);
    if (zone !== player.zone) {
      player.setZone(zone);
      // Entering a zone only announces the place; opening its window is the visit.
      if (zone) useUIStore.getState().showBanner(zone);
    }

    const near = nearestInteractable(interactables.values(), heroBody.x, heroBody.z);
    if ((near?.id ?? null) !== (player.active?.id ?? null)) {
      player.setActive(
        near ? { id: near.id, label: near.label, prompt: near.prompt, kind: near.kind } : null,
      );
    }
  });

  // E / Enter / Space, a click, or the touch ActionButton: run the active object.
  useEffect(
    () =>
      usePlayerStore.subscribe((state, previous) => {
        if (state.interactNonce === previous.interactNonce) return;
        if (selectIsWorldBlocked(useUIStore.getState()) || state.isTransitioning) return;
        if (state.active) interactables.get(state.active.id)?.onInteract();
      }),
    [],
  );
}
