import { copy } from '@/content/copy';
import type { LocationId, WindowId } from '@/content/ids';
import { quests } from '@/content/quests';
import type { Route, Section } from '@/lib/route';
import { openLocation, openQuest } from './actions';
import { useUIStore } from './stores/useUIStore';

// Bridge between URL routes and game state, shared by both modes.

export const SECTION_LOCATION: Record<Section, LocationId> = {
  about: 'guild-hall',
  quests: 'quest-board',
  skills: 'armory',
  experience: 'library',
  contact: 'post-office',
};

const WINDOW_SECTION: Partial<Record<WindowId, Section>> = {
  'guild-hall': 'about',
  'quest-board': 'quests',
  armory: 'skills',
  library: 'experience',
  'post-office': 'contact',
};

/** The route that describes what the Adventure UI currently shows. */
export const routeFromUi = (window: WindowId | null, questId: string | null): Route => {
  if (window === 'quest-board' && questId) return { kind: 'quest', questId };
  const section = window ? WINDOW_SECTION[window] : undefined;
  return section ? { kind: 'section', section } : { kind: 'home' };
};

export const isKnownQuest = (questId: string) => quests.some((quest) => quest.id === questId);

/**
 * Show a route in Adventure Mode. An unknown quest falls back to the board
 * with a toast (UX-GUIDELINES.md §4.2).
 */
export const applyRoute = (route: Route) => {
  const ui = useUIStore.getState();
  if (route.kind === 'home') {
    if (ui.window && WINDOW_SECTION[ui.window]) ui.closeWindow();
    return;
  }
  if (route.kind === 'section') {
    openLocation(SECTION_LOCATION[route.section]);
    return;
  }
  if (isKnownQuest(route.questId)) {
    openQuest(route.questId);
    return;
  }
  openLocation('quest-board');
  ui.pushToast({ kind: 'info', title: copy.quests.notFound });
};
