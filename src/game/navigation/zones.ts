import type { LocationId } from '@/content/ids';
import type { World } from '@/content/schema';

/** Location whose door zone contains the point, or null. */
export const zoneAt = (world: World, x: number, z: number): LocationId | null => {
  let best: LocationId | null = null;
  let bestDistance = Infinity;
  for (const location of world.locations) {
    const distance = Math.hypot(x - location.door[0], z - location.door[2]);
    if (distance <= location.zoneRadius && distance < bestDistance) {
      best = location.id;
      bestDistance = distance;
    }
  }
  return best;
};

export type Reachable = { id: string; x: number; z: number; radius: number };

/** Only one object is active at a time: the closest one in range (PRODUCT.md W-03). */
export const nearestInteractable = <T extends Reachable>(
  items: Iterable<T>,
  x: number,
  z: number,
): T | null => {
  let best: T | null = null;
  let bestDistance = Infinity;
  for (const item of items) {
    const distance = Math.hypot(x - item.x, z - item.z);
    if (distance <= item.radius && distance < bestDistance) {
      best = item;
      bestDistance = distance;
    }
  }
  return best;
};
