import { useMemo } from 'react';
import { copy } from '@/content/copy';
import type { NpcDef } from '@/content/schema';
import { talkTo } from '@/game/actions';
import { talkPoint } from '@/game/navigation/grid';
import { facingFor } from '@/game/navigation/movement';
import { AnimatedSprite, type SpriteController } from '../primitives/AnimatedSprite';
import { BlobShadow } from '../primitives/BlobShadow';
import { Interactable } from '../primitives/Interactable';
import { heroBody } from '../systems/heroState';

type NpcProps = { npc: NpcDef };

/** A townsperson. Turns to face the hero when spoken to. */
export function Npc({ npc }: NpcProps) {
  const [x, , z] = npc.position;
  const controller = useMemo<SpriteController>(
    () => ({ animation: `${npc.id}/idle-down` }),
    [npc.id],
  );

  const onInteract = () => {
    const facing = facingFor(heroBody.x - x, heroBody.z - z, 'down');
    controller.animation = `${npc.id}/idle-${facing}`;
    talkTo(npc.id);
  };

  return (
    <group position={[x, 0, z]}>
      <Interactable
        id={npc.id}
        point={talkPoint(npc.position)}
        radius={1.5}
        prompt={copy.hints.talk}
        label={npc.name}
        kind="npc"
        marker="talk"
        markerPosition={[0, 2, 0]}
        onInteract={onInteract}
      >
        <AnimatedSprite
          atlas="characters"
          animation={`${npc.id}/idle-down`}
          controller={controller}
        />
      </Interactable>
      <BlobShadow />
    </group>
  );
}
