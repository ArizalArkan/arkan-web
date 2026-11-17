import charactersMeta from '../atlases/characters.json';
import worldMeta from '../atlases/world.json';
import { PPU } from '../theme';

// Atlas metadata written by scripts/build-sprites.mjs.

export type AtlasId = 'world' | 'characters';

type Frame = { x: number; y: number; w: number; h: number };
type Animation = { frames: string[]; fps: number; loop: boolean };
type AtlasMeta = {
  image: string;
  size: { w: number; h: number };
  ppu: number;
  frames: Record<string, Frame>;
  animations: Record<string, Animation>;
};

export const atlases: Record<AtlasId, AtlasMeta> = {
  world: worldMeta,
  characters: charactersMeta,
};

export const frameOf = (atlas: AtlasId, name: string): Frame => {
  const frame = atlases[atlas].frames[name];
  if (!frame) throw new Error(`Unknown frame "${name}" in atlas "${atlas}"`);
  return frame;
};

export const animationOf = (atlas: AtlasId, name: string): Animation => {
  const animation = atlases[atlas].animations[name];
  if (!animation) throw new Error(`Unknown animation "${name}" in atlas "${atlas}"`);
  return animation;
};

export type UvRect = { u0: number; v0: number; u1: number; v1: number };

/** UVs with v0 at the bottom edge of the frame (textures load flipped in Y). */
export const frameUv = (atlas: AtlasId, name: string): UvRect => {
  const { x, y, w, h } = frameOf(atlas, name);
  const { size } = atlases[atlas];
  return {
    u0: x / size.w,
    u1: (x + w) / size.w,
    v0: 1 - (y + h) / size.h,
    v1: 1 - y / size.h,
  };
};

/** World size of a frame: texels / 32, the one texel density (DESIGN.md §5.3). */
export const frameSize = (atlas: AtlasId, name: string) => {
  const { w, h } = frameOf(atlas, name);
  return { width: w / PPU, height: h / PPU };
};

/** Write a frame's UVs into a 4-vertex plane's uv array (PlaneGeometry order). */
export const writePlaneUv = (
  uv: { setXY: (i: number, x: number, y: number) => void },
  rect: UvRect,
) => {
  uv.setXY(0, rect.u0, rect.v1);
  uv.setXY(1, rect.u1, rect.v1);
  uv.setXY(2, rect.u0, rect.v0);
  uv.setXY(3, rect.u1, rect.v0);
};
