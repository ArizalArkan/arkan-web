import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import type { Group } from 'three';
import { stepBody, type Facing } from '@/game/navigation/movement';
import { findPath } from '@/game/navigation/path';
import { useGameStore } from '@/game/stores/useGameStore';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { selectIsWorldBlocked, useUIStore } from '@/game/stores/useUIStore';
import type { SpriteController } from '../primitives/AnimatedSprite';
import { grid, heroBody, interactables } from './heroState';
import { input } from './useInputSystem';

// Animation names resolved once, so the frame loop never builds strings.
const ANIMATIONS: Record<'idle' | 'walk', Record<Facing, string>> = {
  idle: {
    down: 'hero/idle-down',
    up: 'hero/idle-up',
    left: 'hero/idle-left',
    right: 'hero/idle-right',
  },
  walk: {
    down: 'hero/walk-down',
    up: 'hero/walk-up',
    left: 'hero/walk-left',
    right: 'hero/walk-right',
  },
};

const local = {
  lastTarget: null as { x: number; z: number } | null,
  hasMoved: false,
};

/**
 * Moves the hero: keyboard direction, or a tap-to-move path. Mutates refs
 * only; the stores are touched on discrete events (first step, arrival).
 */
export function useMovementSystem(group: RefObject<Group | null>, controller: SpriteController) {
  useFrame((_, delta) => {
    const player = usePlayerStore.getState();
    const isBlocked = selectIsWorldBlocked(useUIStore.getState()) || player.isTransitioning;

    // A new tap: plan the path once, not every frame.
    if (player.moveTarget !== local.lastTarget) {
      local.lastTarget = player.moveTarget;
      if (player.moveTarget) {
        const result = findPath(grid, heroBody, player.moveTarget);
        heroBody.path = result.points;
        if (!result.reached && !player.pendingInteract) {
          player.showBlockedTap(player.moveTarget.x, player.moveTarget.z);
        }
      } else {
        heroBody.path.length = 0;
      }
    }

    if (!isBlocked) {
      const direction = input.keyboard?.direction();
      const dirX = direction?.x ?? 0;
      const dirZ = direction?.z ?? 0;
      if ((dirX !== 0 || dirZ !== 0) && player.moveTarget) player.setMoveTarget(null);
      stepBody(grid, heroBody, dirX, dirZ, delta);
    } else {
      heroBody.isMoving = false;
    }

    group.current?.position.set(heroBody.x, 0, heroBody.z);
    controller.animation = ANIMATIONS[heroBody.isMoving ? 'walk' : 'idle'][heroBody.facing];

    if (heroBody.isMoving && !local.hasMoved) {
      local.hasMoved = true;
      useGameStore.getState().markMoved();
    }

    if (heroBody.justArrived) {
      const pending = player.pendingInteract;
      player.setMoveTarget(null);
      local.lastTarget = null;
      // Clicked a far object: we walked there, now interact (UX-GUIDELINES.md §9.2).
      if (pending) interactables.get(pending)?.onInteract();
    }
  });
}
