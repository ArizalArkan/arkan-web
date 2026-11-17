import { useLoader } from '@react-three/fiber';
import {
  DoubleSide,
  MeshBasicMaterial,
  MeshLambertMaterial,
  TextureLoader,
  type Texture,
} from 'three';
import { palette } from '../theme';
import { atlases, type AtlasId } from './atlas';
import { pixelTexture } from './pixelTexture';

type AtlasMaterials = {
  texture: Texture;
  /** Lit by the scene: lantern light warms sprites, the HD-2D signature. */
  lit: MeshLambertMaterial;
  /** Unlit and not tone mapped: windows and flames that feed the bloom pass. */
  glow: MeshBasicMaterial;
  /** Flat gold copy used for the "in range" outline. */
  outline: MeshBasicMaterial;
};

// One material set per atlas, shared by every sprite (ARCHITECTURE.md §10.2).
const cache = new Map<AtlasId, AtlasMaterials>();

export const atlasUrl = (id: AtlasId) => atlases[id].image;

export function useAtlas(id: AtlasId): AtlasMaterials {
  const texture = useLoader(TextureLoader, atlasUrl(id));
  let materials = cache.get(id);
  if (!materials || materials.texture !== texture) {
    pixelTexture(texture);
    // alphaTest, not transparency: sprites write depth and never need sorting.
    const shared = { map: texture, alphaTest: 0.5, side: DoubleSide } as const;
    materials = {
      texture,
      lit: new MeshLambertMaterial(shared),
      glow: new MeshBasicMaterial({ ...shared, toneMapped: false }),
      outline: new MeshBasicMaterial({ ...shared, color: palette.gold400, toneMapped: false }),
    };
    cache.set(id, materials);
  }
  return materials;
}
