import type { Location } from '@/content/schema';
import { openLocation } from '@/game/actions';
import { useGameStore } from '@/game/stores/useGameStore';
import { Interactable } from '../primitives/Interactable';
import { Sprite } from '../primitives/Sprite';
import { Building } from './Building';

type LocationSiteProps = { location: Location };

/**
 * One portfolio location in the town: a building with a door, lit windows
 * and a sign, or the free-standing Quest Board. Interacting opens its window.
 */
export function LocationSite({ location }: LocationSiteProps) {
  const isVisited = useGameStore((state) => state.visited.includes(location.id));
  const [x, , z] = location.position;
  // Interactable works in the group's local space.
  const markerHeight = location.kind === 'board' ? 2.9 : 3.3;
  const doorLocal: [number, number, number] = [
    location.door[0] - x,
    markerHeight,
    location.door[2] - z - 0.2,
  ];

  return (
    <group position={[x, 0, z]}>
      <Interactable
        id={location.id}
        point={location.door}
        radius={1.6}
        prompt={location.prompt}
        label={`${location.name}: ${location.literal}`}
        kind="location"
        marker={isVisited ? 'check' : 'exclaim'}
        markerPosition={doorLocal}
        onInteract={() => openLocation(location.id)}
      >
        {location.kind === 'board' ? (
          <Sprite atlas="world" frame="prop/quest-board" castShadow />
        ) : (
          <Building location={location} />
        )}
      </Interactable>
    </group>
  );
}
