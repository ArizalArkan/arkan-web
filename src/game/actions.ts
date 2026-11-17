import type { LocationId } from '@/content/ids';
import { world } from '@/content/world';
import { useGameStore } from './stores/useGameStore';
import { useUIStore } from './stores/useUIStore';

// Cross-store actions used by the world, the HUD and deep links alike, so
// "visiting" means the same thing however the visitor got there.

/** Open a location's window. This, not walking into its zone, counts as the visit. */
export const openLocation = (locationId: LocationId) => {
  const location = world.locations.find((entry) => entry.id === locationId);
  if (!location) return;
  useUIStore.getState().openWindow(location.window);
  useGameStore.getState().visitLocation(locationId);
};

/** Open one quest's detail page; reading it marks the quest as read. */
export const openQuest = (questId: string) => {
  useUIStore.getState().openQuest(questId);
  useGameStore.getState().visitLocation('quest-board');
  useGameStore.getState().readQuest(questId);
};

/** Start (or repeat) a conversation with an NPC. */
export const talkTo = (npcId: string) => {
  const npc = world.npcs.find((entry) => entry.id === npcId);
  if (!npc) return;
  // A second chat uses the dialog's shorter repeat lines (UX-GUIDELINES.md §9.1).
  const isRepeat = useGameStore.getState().npcsMet.includes(npcId);
  useUIStore.getState().openDialog(npc.dialogId, npcId, isRepeat);
  useGameStore.getState().meetNpc(npcId);
};
