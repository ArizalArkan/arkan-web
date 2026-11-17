import type { World } from '@/content/schema';

// Collision grid (ARCHITECTURE.md §4.5): no physics engine, just walkable
// and blocked cells derived from the town layout.

export type Point = { x: number; z: number };

export type Grid = {
  cols: number;
  rows: number;
  /** Cell size in world units. */
  cell: number;
  /** World coordinate of the grid's top-left corner. */
  originX: number;
  originZ: number;
  blocked: Uint8Array;
};

export const CELLS_PER_UNIT = 2;
export const HERO_RADIUS = 0.3;
/** Keep the hero this far inside the town edge. */
const EDGE_MARGIN = 0.75;
const NPC_SIZE = 0.5;
const TALK_DISTANCE = 1;

type Solid = { x: number; z: number; w: number; d: number };

export const solidsOf = (world: World): Solid[] => [
  ...world.locations.map((location) => ({
    x: location.position[0],
    z: location.position[2],
    w: location.footprint.w,
    d: location.footprint.d,
  })),
  ...world.obstacles.map(({ x, z, w, d }) => ({ x, z, w, d })),
  // People are solid too: the hero stops in front of them, not inside them.
  ...world.npcs.map((npc) => ({
    x: npc.position[0],
    z: npc.position[2],
    w: NPC_SIZE,
    d: NPC_SIZE,
  })),
];

/** Where the hero stands to talk to an NPC: one step south, facing them. */
export const talkPoint = (
  position: readonly [number, number, number],
): [number, number, number] => [position[0], 0, position[2] + TALK_DISTANCE];

export const buildGrid = (world: World, radius = HERO_RADIUS): Grid => {
  const cell = 1 / CELLS_PER_UNIT;
  const cols = world.size.w * CELLS_PER_UNIT;
  const rows = world.size.d * CELLS_PER_UNIT;
  const originX = -world.size.w / 2;
  const originZ = -world.size.d / 2;
  const blocked = new Uint8Array(cols * rows);
  const solids = solidsOf(world);
  const maxX = world.size.w / 2 - EDGE_MARGIN;
  const maxZ = world.size.d / 2 - EDGE_MARGIN;

  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const x = originX + (i + 0.5) * cell;
      const z = originZ + (j + 0.5) * cell;
      const outside = Math.abs(x) > maxX || Math.abs(z) > maxZ;
      const inSolid = solids.some(
        (solid) =>
          Math.abs(x - solid.x) < solid.w / 2 + radius &&
          Math.abs(z - solid.z) < solid.d / 2 + radius,
      );
      if (outside || inSolid) blocked[j * cols + i] = 1;
    }
  }
  return { cols, rows, cell, originX, originZ, blocked };
};

export const cellOf = (grid: Grid, x: number, z: number) => ({
  i: Math.floor((x - grid.originX) / grid.cell),
  j: Math.floor((z - grid.originZ) / grid.cell),
});

export const centerOf = (grid: Grid, i: number, j: number): Point => ({
  x: grid.originX + (i + 0.5) * grid.cell,
  z: grid.originZ + (j + 0.5) * grid.cell,
});

export const isCellWalkable = (grid: Grid, i: number, j: number) =>
  i >= 0 && j >= 0 && i < grid.cols && j < grid.rows && grid.blocked[j * grid.cols + i] === 0;

export const isWalkable = (grid: Grid, x: number, z: number) => {
  const { i, j } = cellOf(grid, x, z);
  return isCellWalkable(grid, i, j);
};

/** Closest walkable cell center, searching outward ring by ring. */
export const nearestWalkable = (grid: Grid, x: number, z: number): Point => {
  if (isWalkable(grid, x, z)) return { x, z };
  const start = cellOf(grid, x, z);
  const limit = Math.max(grid.cols, grid.rows);
  for (let ring = 1; ring <= limit; ring += 1) {
    let best: Point | null = null;
    let bestDistance = Infinity;
    for (let dj = -ring; dj <= ring; dj += 1) {
      for (let di = -ring; di <= ring; di += 1) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== ring) continue;
        if (!isCellWalkable(grid, start.i + di, start.j + dj)) continue;
        const center = centerOf(grid, start.i + di, start.j + dj);
        const distance = (center.x - x) ** 2 + (center.z - z) ** 2;
        if (distance < bestDistance) {
          best = center;
          bestDistance = distance;
        }
      }
    }
    if (best) return best;
  }
  return { x, z };
};

/**
 * Move by (dx, dz), sliding along walls: each axis is tried on its own, so
 * walking diagonally into a wall still glides along it. Writes into `out`.
 */
export const moveWithCollision = (
  grid: Grid,
  x: number,
  z: number,
  dx: number,
  dz: number,
  out: Point,
): Point => {
  let nextX = x;
  let nextZ = z;
  if (dx !== 0 && isWalkable(grid, x + dx, z)) nextX = x + dx;
  if (dz !== 0 && isWalkable(grid, nextX, z + dz)) nextZ = z + dz;
  out.x = nextX;
  out.z = nextZ;
  return out;
};
