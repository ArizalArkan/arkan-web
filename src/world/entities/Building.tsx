import { useMemo } from 'react';
import type { Location } from '@/content/schema';
import { useAtlas } from '../loaders/useAtlas';
import { Sprite } from '../primitives/Sprite';
import { buildingGeometry } from './buildingGeometry';
import { buildingStyles } from './buildingStyles';

type BuildingProps = { location: Location };

/** Low-poly house with pixel textures, a door, lit windows and a sign. */
export function Building({ location }: BuildingProps) {
  const { lit } = useAtlas('world');
  const style = buildingStyles[location.id as keyof typeof buildingStyles];
  const { w, d } = location.footprint;
  const geometry = useMemo(() => buildingGeometry({ ...style, width: w, depth: d }), [style, w, d]);
  const front = d / 2 + 0.01;

  return (
    <>
      <mesh geometry={geometry} material={lit} castShadow receiveShadow />
      <Sprite atlas="world" frame="prop/door" position={[0, 0, front]} />
      <Sprite atlas="world" frame={style.sign} position={[0, 2.1, front + 0.01]} outline={false} />
      {style.windows.map(([wx, wy]) => (
        <Sprite
          key={`${wx}:${wy}`}
          atlas="world"
          frame="prop/window"
          position={[wx, wy, front]}
          glow
          outline={false}
        />
      ))}
    </>
  );
}
