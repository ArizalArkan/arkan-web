import { NearestFilter, SRGBColorSpace, type Texture } from 'three';

/**
 * The one place a texture becomes "pixel art" (ARCHITECTURE.md §4.3):
 * nearest filtering, no mipmaps, sRGB. Never repeat these settings by hand.
 */
export const pixelTexture = <T extends Texture>(texture: T): T => {
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};
