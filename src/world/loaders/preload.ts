import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { atlasUrl } from './useAtlas';

/** Everything the first scene needs, listed explicitly (ARCHITECTURE.md §10.2). */
export const PRELOAD_TEXTURES = [atlasUrl('world'), atlasUrl('characters')];

export const preloadWorldAssets = () => {
  for (const url of PRELOAD_TEXTURES) useLoader.preload(TextureLoader, url);
};
