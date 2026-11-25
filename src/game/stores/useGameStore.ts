import { create } from 'zustand';
import type { LocationId } from '@/content/schema';
import { SAVE_KEY, saveService, type SaveService } from '@/services/save';
import { events } from '../events';
import { applyAction, type GameAction } from '../rules/actions';
import type { AchievementId } from '../rules/achievements';
import {
  computeXp,
  emptyProgress,
  mergeProgress,
  sanitizeProgress,
  type Progress,
} from '../rules/progress';
import { useSettingsStore } from './useSettingsStore';

type GameState = Progress & {
  epoch: number;
  xp: number;
  /** False when the browser refuses storage; UI shows a one-time notice. */
  canPersist: boolean;
  dispatch: (action: GameAction) => void;
  visitLocation: (id: LocationId) => void;
  readQuest: (id: string) => void;
  openLink: (questId: string, index: number) => void;
  meetNpc: (id: string) => void;
  markMoved: () => void;
  markContactSent: () => void;
  resetProgress: () => void;
};

const pickProgress = (state: Progress): Progress => ({
  visited: state.visited,
  questsRead: state.questsRead,
  linksOpened: state.linksOpened,
  npcsMet: state.npcsMet,
  collectibles: state.collectibles,
  achievements: state.achievements,
  contactSent: state.contactSent,
});

const fromSave = (service: SaveService) => {
  const data = service.load();
  const progress = sanitizeProgress({
    ...data,
    visited: data.visited as LocationId[],
    achievements: data.achievements as AchievementId[],
  });
  return { progress, epoch: data.epoch };
};

const initial = fromSave(saveService);

export const useGameStore = create<GameState>()((set, get) => ({
  ...initial.progress,
  epoch: initial.epoch,
  xp: computeXp(initial.progress),
  canPersist: saveService.isAvailable,

  dispatch(action) {
    const { progress, events: produced } = applyAction(pickProgress(get()), action);
    if (produced.length === 0) return;
    set({ ...progress, xp: computeXp(progress) });
    for (const event of produced) events.emit(event);
  },
  visitLocation: (locationId) => get().dispatch({ type: 'visit', locationId }),
  readQuest: (questId) => get().dispatch({ type: 'readQuest', questId }),
  openLink: (questId, index) => get().dispatch({ type: 'openLink', questId, index }),
  meetNpc: (npcId) => get().dispatch({ type: 'meetNpc', npcId }),
  markMoved: () => get().dispatch({ type: 'move' }),
  markContactSent: () => get().dispatch({ type: 'sendContact' }),

  resetProgress() {
    set({ ...emptyProgress(), xp: 0, epoch: get().epoch + 1 });
  },
}));

// ---------- persistence ----------

const writeSave = () => {
  const game = useGameStore.getState();
  const settings = useSettingsStore.getState();
  saveService.save({
    version: 1,
    epoch: game.epoch,
    xp: game.xp,
    ...pickProgress(game),
    settings: {
      mode: settings.savedMode,
      quality: settings.quality,
      sound: settings.sound,
      music: settings.music,
      reducedMotion: settings.reducedMotionOverride,
    },
  });
};

let isPersisting = false;

/** Start writing changes to storage and listening to other tabs. Idempotent. */
export const startPersistence = () => {
  if (isPersisting || typeof window === 'undefined') return () => undefined;
  isPersisting = true;

  const unsubGame = useGameStore.subscribe(writeSave);
  const unsubSettings = useSettingsStore.subscribe(writeSave);

  // Another tab saved: same epoch merges, a newer epoch (a reset) wins.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SAVE_KEY) return;
    const incoming = saveService.parseExternal(event.newValue);
    if (!incoming) return;
    const local = useGameStore.getState();
    if (incoming.epoch < local.epoch) return;
    const incomingProgress = sanitizeProgress({
      ...incoming,
      visited: incoming.visited as LocationId[],
      achievements: incoming.achievements as AchievementId[],
    });
    const merged =
      incoming.epoch > local.epoch
        ? incomingProgress
        : mergeProgress(pickProgress(local), incomingProgress);
    useGameStore.setState({ ...merged, epoch: incoming.epoch, xp: computeXp(merged) });
  };
  window.addEventListener('storage', onStorage);

  return () => {
    unsubGame();
    unsubSettings();
    window.removeEventListener('storage', onStorage);
    isPersisting = false;
  };
};
