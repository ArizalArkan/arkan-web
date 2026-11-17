import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { GroundTile } from '../ground';
import { frameUv } from '../loaders/atlas';
import { useAtlas } from '../loaders/useAtlas';

type TileGroundProps = {
  tiles: GroundTile[];
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
};

/** The whole ground as one merged mesh: one draw call (COMPONENTS.md §6.4). */
export function TileGround({ tiles, onPointerDown }: TileGroundProps) {
  const { lit } = useAtlas('world');

  const geometry = useMemo(() => {
    const positions = new Float32Array(tiles.length * 12);
    const normals = new Float32Array(tiles.length * 12);
    const uvs = new Float32Array(tiles.length * 8);
    const indices: number[] = [];
    tiles.forEach((tile, n) => {
      const { u0, v0, u1, v1 } = frameUv('world', tile.frame);
      const x0 = tile.x - 0.5;
      const x1 = tile.x + 0.5;
      const z0 = tile.z - 0.5;
      const z1 = tile.z + 0.5;
      // North edge is the top of the texture.
      positions.set([x0, 0, z0, x1, 0, z0, x0, 0, z1, x1, 0, z1], n * 12);
      normals.set([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], n * 12);
      uvs.set([u0, v1, u1, v1, u0, v0, u1, v0], n * 8);
      const base = n * 4;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    });
    const merged = new BufferGeometry();
    merged.setAttribute('position', new Float32BufferAttribute(positions, 3));
    merged.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    merged.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    merged.setIndex(indices);
    return merged;
  }, [tiles]);

  return <mesh geometry={geometry} material={lit} receiveShadow onPointerDown={onPointerDown} />;
}
