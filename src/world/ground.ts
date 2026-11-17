import type { World } from '@/content/schema';

// Which tile goes where. Pure, so the layout can be reasoned about without
// rendering: grass everywhere, a cobbled plaza around the fountain, and
// packed-earth paths two tiles wide from the plaza to every door and the gate.

type Segment = { x0: number; z0: number; x1: number; z1: number };

const PLAZA = { x: 0, z: 1, halfW: 4.5, halfD: 3.5 };
const PATH_HALF_WIDTH = 1;
/** Extra grass past the walkable town, so the camera never shows a void. */
const APRON = 10;
/** Row the side streets run along, just south of the north buildings. */
const STREET_Z = -2;

const distanceToSegment = (px: number, pz: number, s: Segment) => {
  const dx = s.x1 - s.x0;
  const dz = s.z1 - s.z0;
  const lengthSq = dx * dx + dz * dz;
  const t =
    lengthSq === 0 ? 0 : Math.min(1, Math.max(0, ((px - s.x0) * dx + (pz - s.z0) * dz) / lengthSq));
  return Math.hypot(px - (s.x0 + dx * t), pz - (s.z0 + dz * t));
};

export const pathSegments = (world: World): Segment[] => {
  const segments: Segment[] = [
    // Gate to plaza, plaza up to the street.
    { x0: 0, z0: world.size.d / 2, x1: 0, z1: PLAZA.z },
    { x0: 0, z0: PLAZA.z, x1: 0, z1: STREET_Z },
  ];
  for (const location of world.locations) {
    const [x, , z] = location.door;
    if (z <= STREET_Z + 0.5) {
      // North row: along the street, then up to the door.
      segments.push(
        { x0: 0, z0: STREET_Z, x1: x, z1: STREET_Z },
        { x0: x, z0: STREET_Z, x1: x, z1: z },
      );
    } else {
      // Beside the plaza: straight out from it on the door's row.
      segments.push({ x0: 0, z0: z, x1: x, z1: z });
    }
  }
  return segments;
};

// Cheap stable hash so the grass pattern is the same on every load.
const hash = (i: number, j: number) => {
  let h = (i * 374761393 + j * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
};

export type GroundTile = { i: number; j: number; x: number; z: number; frame: string };

/** One tile per world unit, x and z being the tile's center. */
export const groundTiles = (world: World): GroundTile[] => {
  const segments = pathSegments(world);
  const tiles: GroundTile[] = [];
  for (let j = -APRON; j < world.size.d + APRON; j += 1) {
    for (let i = -APRON; i < world.size.w + APRON; i += 1) {
      const x = -world.size.w / 2 + i + 0.5;
      const z = -world.size.d / 2 + j + 0.5;
      const h = hash(i, j);
      let frame: string;
      if (Math.abs(x - PLAZA.x) < PLAZA.halfW && Math.abs(z - PLAZA.z) < PLAZA.halfD) {
        frame = h % 2 ? 'tile/plaza-a' : 'tile/plaza-b';
      } else if (segments.some((segment) => distanceToSegment(x, z, segment) < PATH_HALF_WIDTH)) {
        frame = h % 2 ? 'tile/path-a' : 'tile/path-b';
      } else if (h % 8 === 0) {
        frame = 'tile/grass-c';
      } else {
        frame = h % 2 ? 'tile/grass-a' : 'tile/grass-b';
      }
      tiles.push({ i, j, x, z, frame });
    }
  }
  return tiles;
};
