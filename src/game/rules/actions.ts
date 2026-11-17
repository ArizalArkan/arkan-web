import type { LocationId } from '@/content/schema';
import { ACHIEVEMENTS, newlyMetAchievements, type AchievementId } from './achievements';
import { catalog, computeXp, type Progress } from './progress';
import { isMainQuestComplete } from './quests';
import { levelFromXp } from './xp';

export type GameAction =
  | { type: 'visit'; locationId: LocationId }
  | { type: 'readQuest'; questId: string }
  | { type: 'openLink'; questId: string; index: number }
  | { type: 'meetNpc'; npcId: string }
  | { type: 'collect'; collectibleId: string }
  | { type: 'move' }
  | { type: 'sendContact' };

export type GameEvent =
  | { type: 'xp'; amount: number; total: number }
  | { type: 'levelUp'; level: number }
  | { type: 'achievement'; id: AchievementId; name: string }
  | { type: 'locationVisited'; locationId: LocationId }
  | { type: 'questRead'; questId: string }
  | { type: 'mainQuestComplete' };

type ListKey =
  'visited' | 'questsRead' | 'linksOpened' | 'npcsMet' | 'collectibles' | 'achievements';

/** Add `value` to a list once; returns the same progress object when nothing changes. */
const addOnce = <K extends ListKey>(
  progress: Progress,
  key: K,
  value: Progress[K][number],
  allowed: readonly string[],
): Progress => {
  const list = progress[key] as string[];
  if (list.includes(value) || !allowed.includes(value)) return progress;
  return { ...progress, [key]: [...list, value] };
};

const applyRaw = (progress: Progress, action: GameAction): Progress => {
  switch (action.type) {
    case 'visit':
      return addOnce(progress, 'visited', action.locationId, catalog.locations);
    case 'readQuest':
      return addOnce(progress, 'questsRead', action.questId, catalog.quests);
    case 'openLink':
      return addOnce(progress, 'linksOpened', `${action.questId}#${action.index}`, catalog.links);
    case 'meetNpc':
      return addOnce(progress, 'npcsMet', action.npcId, catalog.npcs);
    case 'collect':
      return addOnce(progress, 'collectibles', action.collectibleId, catalog.collectibles);
    case 'move':
      return addOnce(progress, 'achievements', 'first-steps' satisfies AchievementId, [
        'first-steps',
      ]);
    case 'sendContact':
      return progress.contactSent ? progress : { ...progress, contactSent: true };
  }
};

/**
 * Apply one visitor action. Returns the new progress (the same object when
 * nothing changed, so repeats are free) and the events it produced, in the
 * order the UI should announce them.
 */
export const applyAction = (progress: Progress, action: GameAction) => {
  const stepped = applyRaw(progress, action);
  if (stepped === progress) return { progress, events: [] as GameEvent[] };

  const unlocked = newlyMetAchievements(stepped, catalog);
  const next: Progress = unlocked.length
    ? { ...stepped, achievements: [...stepped.achievements, ...unlocked] }
    : stepped;

  const events: GameEvent[] = [];
  if (action.type === 'visit')
    events.push({ type: 'locationVisited', locationId: action.locationId });
  if (action.type === 'readQuest') events.push({ type: 'questRead', questId: action.questId });

  const before = computeXp(progress);
  const after = computeXp(next);
  if (after > before) events.push({ type: 'xp', amount: after - before, total: after });

  const newAchievements = next.achievements.filter((id) => !progress.achievements.includes(id));
  for (const id of newAchievements) {
    events.push({ type: 'achievement', id, name: ACHIEVEMENTS[id].name });
  }

  const levelBefore = levelFromXp(before);
  const levelAfter = levelFromXp(after);
  if (levelAfter > levelBefore) events.push({ type: 'levelUp', level: levelAfter });

  if (!isMainQuestComplete(progress) && isMainQuestComplete(next)) {
    events.push({ type: 'mainQuestComplete' });
  }

  return { progress: next, events };
};
