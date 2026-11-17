import {
  cellOf,
  centerOf,
  isCellWalkable,
  isWalkable,
  nearestWalkable,
  type Grid,
  type Point,
} from './grid';

// A* for tap-to-move (ARCHITECTURE.md §4.5): 8 directions, no cutting
// corners, then straightened with line-of-sight checks so the hero does not
// zig-zag along cell centers.

const SQRT2 = Math.SQRT2;
const NEIGHBORS: readonly [number, number, number][] = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, SQRT2],
  [1, -1, SQRT2],
  [-1, 1, SQRT2],
  [-1, -1, SQRT2],
];

const octile = (di: number, dj: number) => {
  const a = Math.abs(di);
  const b = Math.abs(dj);
  return a + b + (SQRT2 - 2) * Math.min(a, b);
};

/** True when a straight walk from a to b stays on walkable cells. */
export const hasLineOfSight = (grid: Grid, a: Point, b: Point) => {
  const distance = Math.hypot(b.x - a.x, b.z - a.z);
  const steps = Math.max(1, Math.ceil(distance / (grid.cell / 2)));
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    if (!isWalkable(grid, a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return false;
  }
  return true;
};

const smooth = (grid: Grid, points: Point[]) => {
  if (points.length <= 2) return points;
  const result: Point[] = [points[0]!];
  let anchor = 0;
  while (anchor < points.length - 1) {
    let next = points.length - 1;
    while (next > anchor + 1 && !hasLineOfSight(grid, points[anchor]!, points[next]!)) next -= 1;
    result.push(points[next]!);
    anchor = next;
  }
  return result;
};

export type PathResult = {
  /** Waypoints after the start position; empty when already there. */
  points: Point[];
  /** False when the target was unreachable and the path ends at the nearest point. */
  reached: boolean;
};

export const findPath = (grid: Grid, from: Point, to: Point): PathResult => {
  const start = nearestWalkable(grid, from.x, from.z);
  const targetWalkable = isWalkable(grid, to.x, to.z);
  const goal = targetWalkable ? to : nearestWalkable(grid, to.x, to.z);
  const s = cellOf(grid, start.x, start.z);
  const g = cellOf(grid, goal.x, goal.z);
  const size = grid.cols * grid.rows;
  const index = (i: number, j: number) => j * grid.cols + i;

  const cost = new Float32Array(size).fill(Infinity);
  const parent = new Int32Array(size).fill(-1);
  const closed = new Uint8Array(size);
  const open: number[] = [index(s.i, s.j)];
  const score = new Float32Array(size).fill(Infinity);
  cost[index(s.i, s.j)] = 0;
  score[index(s.i, s.j)] = octile(g.i - s.i, g.j - s.j);

  let closest = index(s.i, s.j);
  let closestH = octile(g.i - s.i, g.j - s.j);
  let found = false;

  while (open.length > 0) {
    // The grid is small (about 4k cells), so a linear scan beats a heap here.
    let bestAt = 0;
    for (let k = 1; k < open.length; k += 1) {
      if (score[open[k]!]! < score[open[bestAt]!]!) bestAt = k;
    }
    const current = open[bestAt]!;
    open[bestAt] = open[open.length - 1]!;
    open.pop();
    if (closed[current]) continue;
    closed[current] = 1;

    const ci = current % grid.cols;
    const cj = Math.floor(current / grid.cols);
    if (ci === g.i && cj === g.j) {
      found = true;
      break;
    }
    const h = octile(g.i - ci, g.j - cj);
    if (h < closestH) {
      closestH = h;
      closest = current;
    }

    for (const [di, dj, stepCost] of NEIGHBORS) {
      const ni = ci + di;
      const nj = cj + dj;
      if (!isCellWalkable(grid, ni, nj)) continue;
      // No squeezing diagonally between two blocked corners.
      if (
        di !== 0 &&
        dj !== 0 &&
        (!isCellWalkable(grid, ci + di, cj) || !isCellWalkable(grid, ci, cj + dj))
      ) {
        continue;
      }
      const next = index(ni, nj);
      if (closed[next]) continue;
      const tentative = cost[current]! + stepCost;
      if (tentative < cost[next]!) {
        cost[next] = tentative;
        parent[next] = current;
        score[next] = tentative + octile(g.i - ni, g.j - nj);
        open.push(next);
      }
    }
  }

  const end = found ? index(g.i, g.j) : closest;
  const cells: Point[] = [];
  for (let at = end; at !== -1; at = parent[at]!) {
    cells.push(centerOf(grid, at % grid.cols, Math.floor(at / grid.cols)));
  }
  cells.reverse();
  cells[0] = { x: from.x, z: from.z };
  // Finish on the exact tap point, not the cell center, when it is reachable.
  if (found && cells.length > 0) cells[cells.length - 1] = { x: goal.x, z: goal.z };
  if (found && cells.length === 1) cells.push({ x: goal.x, z: goal.z });

  const points = smooth(grid, cells).slice(1);
  return { points, reached: found && targetWalkable };
};
