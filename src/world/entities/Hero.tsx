import { useRef } from 'react';
import type { Group } from 'three';
import { AnimatedSprite, type SpriteController } from '../primitives/AnimatedSprite';
import { BlobShadow } from '../primitives/BlobShadow';
import { useMovementSystem } from '../systems/useMovementSystem';

// Module-level so the movement system can change the animation without React.
const controller: SpriteController = { animation: 'hero/idle-down' };

/** The owner's avatar. Driven entirely by the movement system. */
export function Hero() {
  const group = useRef<Group>(null);
  useMovementSystem(group, controller);

  return (
    <group ref={group}>
      <AnimatedSprite
        atlas="characters"
        animation="hero/idle-down"
        controller={controller}
        outline={false}
      />
      <BlobShadow />
    </group>
  );
}
