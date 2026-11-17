import { useContext, useMemo } from 'react';
import { frameSize, type AtlasId } from '../loaders/atlas';
import { useAtlas } from '../loaders/useAtlas';
import { InteractableContext } from './InteractableContext';
import { OUTLINE_OFFSETS, spriteGeometry } from './spriteShared';

type SpriteProps = {
  atlas: AtlasId;
  frame: string;
  /** 'bottom' puts the pivot at the feet so the sprite stands on the ground. */
  anchor?: 'bottom' | 'center';
  flipX?: boolean;
  /** Gold 1-texel outline. Defaults to "the enclosing Interactable is in range". */
  outline?: boolean;
  /** Unlit and bloom-friendly, for windows and flames. */
  glow?: boolean;
  castShadow?: boolean;
  position?: [number, number, number];
};

/**
 * A pixel-art plane (COMPONENTS.md §6.1). World size is always frame texels
 * / 32, so never pass a scale. The camera's yaw is fixed, which makes
 * "billboard on the Y axis" simply "face +z and stay upright".
 */
export function Sprite({
  atlas,
  frame,
  anchor = 'bottom',
  flipX = false,
  outline,
  glow = false,
  castShadow = false,
  position,
}: SpriteProps) {
  const materials = useAtlas(atlas);
  const inRange = useContext(InteractableContext);
  const geometry = useMemo(() => spriteGeometry(atlas, frame), [atlas, frame]);
  const { height } = frameSize(atlas, frame);
  const y = anchor === 'bottom' ? height / 2 : 0;
  const showOutline = outline ?? inRange;

  return (
    <group position={position} scale-x={flipX ? -1 : 1}>
      <mesh
        geometry={geometry}
        material={glow ? materials.glow : materials.lit}
        position-y={y}
        castShadow={castShadow}
      />
      {showOutline
        ? OUTLINE_OFFSETS.map(([dx, dy]) => (
            <mesh
              key={`${dx}:${dy}`}
              geometry={geometry}
              material={materials.outline}
              position={[dx, y + dy, -0.002]}
            />
          ))
        : null}
    </group>
  );
}
