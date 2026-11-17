import { world } from '@/content/world';
import { buildGrid } from '@/game/navigation/grid';
import { createBody } from '@/game/navigation/movement';
import type { Reachable } from '@/game/navigation/zones';
import type { Interactable as InteractableInfo } from '@/game/stores/usePlayerStore';

// Per-frame state lives here as plain mutable objects, never in a store
// (ARCHITECTURE.md §5.1). Systems read and write these inside useFrame.

export const grid = buildGrid(world);

export const heroBody = createBody(world.spawn[0], world.spawn[2]);

export type InteractableEntry = Reachable & InteractableInfo & { onInteract: () => void };

/** Every Interactable in the scene registers itself here. */
export const interactables = new Map<string, InteractableEntry>();

/** Set when the camera should jump instead of glide (Fast Travel, first frame). */
export const cameraState = { snap: true };
