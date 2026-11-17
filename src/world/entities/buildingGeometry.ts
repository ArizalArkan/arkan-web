import { BufferGeometry, Float32BufferAttribute } from 'three';
import { frameUv, type UvRect } from '../loaders/atlas';

// Low-poly buildings with pixel textures at the same texel density as
// everything else (DESIGN.md §5.3): every surface is cut into 1-unit quads,
// each mapped to one 32x32 tile of the atlas.

type Vec3 = [number, number, number];

type Sink = { positions: number[]; normals: number[]; uvs: number[]; indices: number[] };

const add = (a: Vec3, b: Vec3, scale: number): Vec3 => [
  a[0] + b[0] * scale,
  a[1] + b[1] * scale,
  a[2] + b[2] * scale,
];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const pushQuad = (
  sink: Sink,
  corners: [Vec3, Vec3, Vec3, Vec3],
  uv: [number, number][],
  normal: Vec3,
) => {
  const base = sink.positions.length / 3;
  corners.forEach((corner, index) => {
    sink.positions.push(...corner);
    sink.normals.push(...normal);
    sink.uvs.push(uv[index]![0], uv[index]![1]);
  });
  sink.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
};

/**
 * A flat rectangle cut into 1-unit tiles. `u` runs along the width, `v` up
 * the height; the face normal is u x v. Partial tiles at the far edges show
 * the matching part of the texture instead of squashing it.
 */
const pushTiledPlane = (
  sink: Sink,
  origin: Vec3,
  u: Vec3,
  v: Vec3,
  width: number,
  height: number,
  rect: UvRect,
) => {
  const normal = cross(u, v);
  for (let j = 0; j < height; j += 1) {
    for (let i = 0; i < width; i += 1) {
      const w = Math.min(1, width - i);
      const h = Math.min(1, height - j);
      const o = add(add(origin, u, i), v, j);
      const uMax = rect.u0 + (rect.u1 - rect.u0) * w;
      const vMax = rect.v0 + (rect.v1 - rect.v0) * h;
      pushQuad(
        sink,
        [o, add(o, u, w), add(add(o, u, w), v, h), add(o, v, h)],
        [
          [rect.u0, rect.v0],
          [uMax, rect.v0],
          [uMax, vMax],
          [rect.u0, vMax],
        ],
        normal,
      );
    }
  }
};

/** Gable end: a triangle built from 1-unit rows, each split into narrow columns. */
const pushGable = (
  sink: Sink,
  x: number,
  baseY: number,
  halfDepth: number,
  rise: number,
  facing: 1 | -1,
  rect: UvRect,
) => {
  const normal: Vec3 = [facing, 0, 0];
  const halfAt = (y: number) => halfDepth * Math.max(0, 1 - y / rise);
  for (let j = 0; j < rise; j += 1) {
    const y0 = j;
    const y1 = Math.min(rise, j + 1);
    const bottom = halfAt(y0);
    const top = halfAt(y1);
    const columns = Math.max(1, Math.ceil(bottom * 2));
    for (let k = 0; k < columns; k += 1) {
      const t0 = k / columns;
      const t1 = (k + 1) / columns;
      // facing +x looks at the wall from the east, so z runs the other way.
      const z = (half: number, t: number) => facing * (half - 2 * half * t);
      const widthUv = Math.min(1, (bottom * 2) / columns);
      const uMax = rect.u0 + (rect.u1 - rect.u0) * widthUv;
      const vMax = rect.v0 + (rect.v1 - rect.v0) * (y1 - y0);
      pushQuad(
        sink,
        [
          [x, baseY + y0, z(bottom, t0)],
          [x, baseY + y0, z(bottom, t1)],
          [x, baseY + y1, z(top, t1)],
          [x, baseY + y1, z(top, t0)],
        ],
        [
          [rect.u0, rect.v0],
          [uMax, rect.v0],
          [uMax, vMax],
          [rect.u0, vMax],
        ],
        normal,
      );
    }
  }
};

export type BuildingShape = {
  width: number;
  depth: number;
  wallHeight: number;
  /** Height of the roof ridge above the walls. */
  roofRise: number;
  /** How far the roof sticks out past the walls. */
  overhang: number;
  wall: string;
  /** Optional different material for the bottom row (a stone footing). */
  footing?: string;
  roof: string;
};

/**
 * One merged mesh per building, centered on its footprint, standing on y = 0.
 * The ridge runs east-west so the camera, looking north, sees the front
 * slope and its shingles.
 */
export const buildingGeometry = (shape: BuildingShape) => {
  const { width: w, depth: d, wallHeight: h, roofRise: rise, overhang: o } = shape;
  const sink: Sink = { positions: [], normals: [], uvs: [], indices: [] };
  const wall = frameUv('world', shape.wall);
  const footing = shape.footing ? frameUv('world', shape.footing) : null;
  const roof = frameUv('world', shape.roof);

  const faces: { origin: Vec3; u: Vec3 }[] = [
    { origin: [-w / 2, 0, d / 2], u: [1, 0, 0] }, // front (south)
    { origin: [w / 2, 0, -d / 2], u: [-1, 0, 0] }, // back
    { origin: [-w / 2, 0, -d / 2], u: [0, 0, 1] }, // west
    { origin: [w / 2, 0, d / 2], u: [0, 0, -1] }, // east
  ];
  faces.forEach(({ origin, u }, index) => {
    const span = index < 2 ? w : d;
    const up: Vec3 = [0, 1, 0];
    if (footing) {
      pushTiledPlane(sink, origin, u, up, span, 1, footing);
      pushTiledPlane(sink, add(origin, up, 1), u, up, span, h - 1, wall);
    } else {
      pushTiledPlane(sink, origin, u, up, span, h, wall);
    }
  });

  pushGable(sink, -w / 2, h, d / 2, rise, -1, wall);
  pushGable(sink, w / 2, h, d / 2, rise, 1, wall);

  // Roof slopes continue past the walls by the overhang, along the same pitch.
  const run = d / 2 + o;
  const slopeLength = Math.hypot(run, rise * (run / (d / 2)));
  const eaveY = h - (rise / (d / 2)) * o;
  const ridgeY = h + rise;
  const upFront: Vec3 = [0, (ridgeY - eaveY) / slopeLength, -run / slopeLength];
  const upBack: Vec3 = [0, (ridgeY - eaveY) / slopeLength, run / slopeLength];
  pushTiledPlane(sink, [-w / 2 - o, eaveY, run], [1, 0, 0], upFront, w + 2 * o, slopeLength, roof);
  pushTiledPlane(sink, [w / 2 + o, eaveY, -run], [-1, 0, 0], upBack, w + 2 * o, slopeLength, roof);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(sink.positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(sink.normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(sink.uvs, 2));
  geometry.setIndex(sink.indices);
  return geometry;
};
