import { PlaneGeometry } from 'three';
import { frameSize, frameUv, writePlaneUv, type AtlasId } from '../loaders/atlas';
import { PPU } from '../theme';

// Static frames share one geometry per frame.
const geometryCache = new Map<string, PlaneGeometry>();

export const spriteGeometry = (atlas: AtlasId, frame: string) => {
  const key = `${atlas}:${frame}`;
  let geometry = geometryCache.get(key);
  if (!geometry) {
    const { width, height } = frameSize(atlas, frame);
    geometry = new PlaneGeometry(width, height);
    writePlaneUv(geometry.attributes.uv!, frameUv(atlas, frame));
    geometryCache.set(key, geometry);
  }
  return geometry;
};

const TEXEL = 1 / PPU;
export const OUTLINE_OFFSETS: readonly [number, number][] = [
  [TEXEL, 0],
  [-TEXEL, 0],
  [0, TEXEL],
  [0, -TEXEL],
];
