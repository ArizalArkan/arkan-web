import { useState } from 'react';
import { copy } from '@/content/copy';
import type { LocationId } from '@/content/ids';
import { world } from '@/content/world';
import { useGameStore } from '@/game/stores/useGameStore';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { useUIStore } from '@/game/stores/useUIStore';
import { MenuList } from '../patterns/MenuList';
import { Window } from '../patterns/Window';
import type { IconName } from '../primitives/iconData';
import { Tag } from '../primitives/Tag';

const ICONS: Record<LocationId, IconName> = {
  'guild-hall': 'hall',
  'quest-board': 'scroll',
  armory: 'sword',
  library: 'book',
  'post-office': 'letter',
};

/**
 * Every location one keypress away (PRODUCT.md W-04). Picking one closes the
 * menu, covers the screen, moves the hero to the door and opens the window.
 */
export function FastTravelMenu() {
  const visited = useGameStore((state) => state.visited);
  const closeWindow = useUIStore((state) => state.closeWindow);
  const [value, setValue] = useState<string | null>(null);

  const travel = (id: string) => {
    closeWindow();
    usePlayerStore.getState().requestTravel(id as LocationId, true);
  };

  return (
    <Window id="fast-travel" title={copy.fastTravel.title} icon="map" onClose={closeWindow}>
      <p className="mb-4 font-body text-body-md">{copy.fastTravel.intro}</p>
      <MenuList
        label={copy.fastTravel.title}
        autoFocus
        value={value}
        onChange={setValue}
        onConfirm={travel}
        items={world.locations.map((location) => {
          const isVisited = visited.includes(location.id);
          return {
            id: location.id,
            label: location.name,
            hint: location.literal,
            icon: ICONS[location.id],
            badge: isVisited ? (
              <Tag tone="herb" icon="check">
                {copy.fastTravel.visited}
              </Tag>
            ) : (
              <Tag tone="gold" icon="star">
                {copy.fastTravel.fresh}
              </Tag>
            ),
          };
        })}
      />
    </Window>
  );
}
