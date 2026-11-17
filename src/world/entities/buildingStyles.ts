import type { LocationId } from '@/content/ids';
import type { BuildingShape } from './buildingGeometry';

// Each building reads differently at a glance: its own wall, its own roof
// color, its own sign. Width and depth come from the location's footprint.

export type BuildingStyle = Omit<BuildingShape, 'width' | 'depth'> & {
  sign: string;
  /** Lit windows on the front wall: [x from center, y of the window's base]. */
  windows: [number, number][];
};

type BuildingId = Exclude<LocationId, 'quest-board'>;

export const buildingStyles: Record<BuildingId, BuildingStyle> = {
  // The biggest house in town: half-timbered over a stone footing, slate roof.
  'guild-hall': {
    wallHeight: 4,
    roofRise: 2.5,
    overhang: 0.5,
    wall: 'wall/plaster',
    footing: 'wall/stone',
    roof: 'roof/slate',
    sign: 'sign/guild-hall',
    windows: [
      [-2.5, 1],
      [2.5, 1],
      [-1.5, 2.6],
      [1.5, 2.6],
    ],
  },
  // A forge: all stone under an iron-grey roof.
  armory: {
    wallHeight: 3,
    roofRise: 1.5,
    overhang: 0.4,
    wall: 'wall/stone',
    roof: 'roof/iron',
    sign: 'sign/armory',
    windows: [
      [-1.5, 1],
      [1.5, 1],
    ],
  },
  // Tall and narrow, with a teal roof.
  library: {
    wallHeight: 4,
    roofRise: 2,
    overhang: 0.4,
    wall: 'wall/plaster',
    footing: 'wall/stone',
    roof: 'roof/teal',
    sign: 'sign/library',
    windows: [
      [-1.5, 1],
      [1.5, 1],
      [-1.5, 2.6],
      [1.5, 2.6],
    ],
  },
  // Brick with a terracotta roof, the warmest building on the street.
  'post-office': {
    wallHeight: 3,
    roofRise: 1.5,
    overhang: 0.4,
    wall: 'wall/brick',
    roof: 'roof/terra',
    sign: 'sign/post-office',
    windows: [
      [-1.5, 1],
      [1.5, 1],
    ],
  },
};
