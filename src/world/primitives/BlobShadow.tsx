import { CircleGeometry, MeshBasicMaterial } from 'three';
import { palette } from '../theme';

// One shared ellipse for every character: sprites are flat planes, so a
// shadow map would give them a sliver of a shadow (DESIGN.md §8.1).
const geometry = new CircleGeometry(0.5, 20);
geometry.rotateX(-Math.PI / 2);
const material = new MeshBasicMaterial({
  color: palette.night900,
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
});

type BlobShadowProps = { width?: number; depth?: number };

export function BlobShadow({ width = 0.7, depth = 0.34 }: BlobShadowProps) {
  return (
    <mesh
      geometry={geometry}
      material={material}
      position-y={0.02}
      scale={[width, 1, depth]}
      renderOrder={1}
    />
  );
}
