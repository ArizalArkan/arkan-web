import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { PointLight } from 'three';
import { qa } from '../qa';
import { lighting } from '../theme';
import { Sprite } from './Sprite';

type LanternProps = {
  position: [number, number, number];
  /** Real point light. At most 6 cast in the scene; the rest only glow. */
  castLight?: boolean;
  /** Offsets the flicker so lanterns do not pulse in unison. */
  phase?: number;
};

const LIGHT_HEIGHT = 1.7;
const BASE_INTENSITY = 9;

/** Lamp post: lit sprite, an unlit flame that blooms, and an optional warm light. */
export function Lantern({ position, castLight = false, phase = 0 }: LanternProps) {
  const light = useRef<PointLight>(null);

  // Gentle +-8% flicker (DESIGN.md §3.5). HD layer, so it moves smoothly.
  useFrame(({ clock }) => {
    if (!light.current || qa.freeze) return;
    const t = clock.elapsedTime + phase;
    light.current.intensity =
      BASE_INTENSITY *
      (1 + lighting.lanternFlicker * (Math.sin(t * 7.3) * 0.6 + Math.sin(t * 13.1) * 0.4));
  });

  return (
    <group position={position}>
      <Sprite atlas="world" frame="prop/lantern-post" outline={false} />
      <Sprite
        atlas="world"
        frame="prop/lantern-flame"
        position={[0, 1.5, 0.01]}
        glow
        outline={false}
      />
      {castLight ? (
        <pointLight
          ref={light}
          position={[0, LIGHT_HEIGHT, 0.4]}
          color={lighting.lanternHot}
          intensity={BASE_INTENSITY}
          distance={7}
          decay={1.6}
        />
      ) : null}
    </group>
  );
}
