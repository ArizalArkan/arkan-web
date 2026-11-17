import { moveWithCollision, type Grid, type Point } from './grid';

// Hero movement step. Mutates a single body object so the render loop can
// call it every frame without allocating (ARCHITECTURE.md §12.3).

export type Facing = 'down' | 'up' | 'left' | 'right';

export type HeroBody = {
  x: number;
  z: number;
  facing: Facing;
  isMoving: boolean;
  /** Remaining tap-to-move waypoints. */
  path: Point[];
  /** Set for one step when the last waypoint is reached. */
  justArrived: boolean;
};

export const HERO_SPEED = 4; // units per second
/** A tab that just woke up must not teleport the hero (ARCHITECTURE.md §4.4). */
export const MAX_DT = 1 / 20;
const ARRIVE_EPSILON = 0.05;

export const createBody = (x: number, z: number): HeroBody => ({
  x,
  z,
  facing: 'down',
  isMoving: false,
  path: [],
  justArrived: false,
});

export const facingFor = (dx: number, dz: number, current: Facing): Facing => {
  if (dx === 0 && dz === 0) return current;
  // Ties go to the vertical axis so diagonals read as up/down, like 16-bit RPGs.
  if (Math.abs(dx) > Math.abs(dz)) return dx < 0 ? 'left' : 'right';
  return dz < 0 ? 'up' : 'down';
};

export const animationFor = (body: Pick<HeroBody, 'facing' | 'isMoving'>) =>
  `${body.isMoving ? 'walk' : 'idle'}-${body.facing}`;

const scratch: Point = { x: 0, z: 0 };

/**
 * Advance the hero by `dt` seconds. Keyboard direction (dirX, dirZ, each
 * -1..1) wins over a tap-to-move path and cancels it.
 */
export const stepBody = (grid: Grid, body: HeroBody, dirX: number, dirZ: number, rawDt: number) => {
  const dt = Math.min(Math.max(rawDt, 0), MAX_DT);
  body.justArrived = false;
  const startX = body.x;
  const startZ = body.z;

  if (dirX !== 0 || dirZ !== 0) {
    body.path.length = 0;
    const length = Math.hypot(dirX, dirZ);
    const step = HERO_SPEED * dt;
    moveWithCollision(
      grid,
      body.x,
      body.z,
      (dirX / length) * step,
      (dirZ / length) * step,
      scratch,
    );
    body.x = scratch.x;
    body.z = scratch.z;
    body.facing = facingFor(dirX, dirZ, body.facing);
    // Pushing against a wall still plays the walk cycle only if we moved.
    body.isMoving = body.x !== startX || body.z !== startZ;
    return body;
  }

  let budget = HERO_SPEED * dt;
  while (budget > 0 && body.path.length > 0) {
    const target = body.path[0]!;
    const dx = target.x - body.x;
    const dz = target.z - body.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= ARRIVE_EPSILON || distance <= budget) {
      if (distance > ARRIVE_EPSILON) body.facing = facingFor(dx, dz, body.facing);
      body.x = target.x;
      body.z = target.z;
      budget -= distance;
      body.path.shift();
      if (body.path.length === 0) body.justArrived = true;
    } else {
      body.x += (dx / distance) * budget;
      body.z += (dz / distance) * budget;
      body.facing = facingFor(dx, dz, body.facing);
      budget = 0;
    }
  }
  body.isMoving = body.x !== startX || body.z !== startZ;
  return body;
};

export const teleportBody = (body: HeroBody, x: number, z: number, facing: Facing = 'up') => {
  body.x = x;
  body.z = z;
  body.facing = facing;
  body.isMoving = false;
  body.path.length = 0;
  body.justArrived = false;
};
