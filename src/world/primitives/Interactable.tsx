import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useRef, type ReactNode } from 'react';
import type { Group } from 'three';
import { nearestWalkable } from '@/game/navigation/grid';
import {
  usePlayerStore,
  type Interactable as InteractableInfo,
} from '@/game/stores/usePlayerStore';
import { selectIsWorldBlocked, useUIStore } from '@/game/stores/useUIStore';
import { qa } from '../qa';
import { grid, interactables } from '../systems/heroState';
import { InteractableContext } from './InteractableContext';
import { setCursor } from './setCursor';
import { Sprite } from './Sprite';

type InteractableProps = {
  id: string;
  /** World point the hero stands on to interact (also the Fast Travel spot). */
  point: [number, number, number];
  radius?: number;
  /** Hint text, e.g. "Read the board". */
  prompt: string;
  /** Name for accessible lists and Fast Travel. */
  label: string;
  kind: InteractableInfo['kind'];
  marker?: 'exclaim' | 'check' | 'talk' | 'none';
  /** Local position of the floating marker. */
  markerPosition?: [number, number, number];
  onInteract: () => void;
  children: ReactNode;
};

const BOB_HEIGHT = 0.08;

/**
 * Makes a world object interactive (COMPONENTS.md §6.3): registers with the
 * interaction system, handles click and tap (walk there, then interact),
 * shows a floating marker, and outlines its sprites while in range.
 */
export function Interactable({
  id,
  point,
  radius = 1.5,
  prompt,
  label,
  kind,
  marker = 'exclaim',
  markerPosition = [0, 2.2, 0],
  onInteract,
  children,
}: InteractableProps) {
  const isActive = usePlayerStore((state) => state.active?.id === id);
  const markerRef = useRef<Group>(null);
  const handler = useRef(onInteract);
  useEffect(() => {
    handler.current = onInteract;
  }, [onInteract]);

  const [x, , z] = point;
  useEffect(() => {
    interactables.set(id, {
      id,
      x,
      z,
      radius,
      label,
      prompt,
      kind,
      onInteract: () => handler.current(),
    });
    return () => {
      interactables.delete(id);
    };
  }, [id, x, z, radius, label, prompt, kind]);

  // Stepped two-position bob: pixel layer moves in steps (DESIGN.md §7).
  useFrame(({ clock }) => {
    if (!markerRef.current || qa.freeze) return;
    markerRef.current.position.y =
      markerPosition[1] + (Math.floor(clock.elapsedTime * 2) % 2) * BOB_HEIGHT;
  });

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (selectIsWorldBlocked(useUIStore.getState())) return;
    event.stopPropagation();
    const player = usePlayerStore.getState();
    player.setInputDevice(event.pointerType === 'touch' ? 'touch' : 'pointer');
    if (player.active?.id === id) {
      handler.current();
      return;
    }
    // Far away: walk to it, then interact on arrival.
    player.setMoveTarget(nearestWalkable(grid, x, z), id);
  };

  return (
    <InteractableContext.Provider value={isActive}>
      <group
        onPointerDown={onPointerDown}
        onPointerOver={(event) => {
          event.stopPropagation();
          setCursor('pointer');
        }}
        onPointerOut={() => setCursor('auto')}
      >
        {children}
        {marker !== 'none' && !isActive ? (
          <group ref={markerRef} position={markerPosition}>
            <Sprite atlas="world" frame={`marker/${marker}`} anchor="center" glow outline={false} />
          </group>
        ) : null}
      </group>
    </InteractableContext.Provider>
  );
}
