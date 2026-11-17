import { copy } from '@/content/copy';
import { world } from '@/content/world';
import { useUIStore } from '@/game/stores/useUIStore';
import { AnimatedSprite } from '../primitives/AnimatedSprite';
import { Interactable } from '../primitives/Interactable';
import { Lantern } from '../primitives/Lantern';
import { Sprite } from '../primitives/Sprite';

const propFrame = (id: string) => {
  if (id === 'fountain') return null;
  if (id.startsWith('gate-post')) return 'prop/gate-post';
  // Alternate the two tree shapes so the tree line is not a row of clones.
  return id.length % 2 ? 'prop/tree-a' : 'prop/tree-b';
};

/** Everything in town that is not a location, the hero or an NPC. */
export function Scenery() {
  const fountain = world.obstacles.find((obstacle) => obstacle.id === 'fountain');
  const [signX, , signZ] = world.signpost.position;

  return (
    <>
      {fountain ? (
        <group position={[fountain.x, 0, fountain.z]}>
          <AnimatedSprite atlas="world" animation="prop/fountain" outline={false} />
        </group>
      ) : null}

      {world.obstacles.map((obstacle) => {
        const frame = propFrame(obstacle.id);
        return frame ? (
          <Sprite
            key={obstacle.id}
            atlas="world"
            frame={frame}
            position={[obstacle.x, 0, obstacle.z]}
            outline={false}
            castShadow
          />
        ) : null;
      })}

      {world.lanterns.map((lantern, index) => (
        <Lantern
          key={lantern.position.join(':')}
          position={lantern.position}
          castLight={lantern.castLight}
          phase={index * 1.7}
        />
      ))}

      {/* The signpost doubles as an in-world way to open Fast Travel. */}
      <group position={[signX, 0, signZ]}>
        <Interactable
          id="signpost"
          point={[signX, 0, signZ + 0.8]}
          radius={1.3}
          prompt={copy.hints.readSign}
          label={copy.fastTravel.title}
          kind="sign"
          marker="none"
          onInteract={() => useUIStore.getState().openWindow('fast-travel')}
        >
          <Sprite atlas="world" frame="prop/signpost" />
        </Interactable>
      </group>
    </>
  );
}
