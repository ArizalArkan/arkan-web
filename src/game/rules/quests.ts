// Quest status (PRODUCT.md §7.2). `locked` exists in the model but is never
// used for portfolio content: nothing the visitor needs is ever locked.

import { LOCATION_IDS, type LocationId } from '@/content/ids';
import type { Progress } from './progress';

export type QuestStatus = 'locked' | 'available' | 'active' | 'completed';
export type ProjectQuestStatus = 'new' | 'read';

export const isMainQuestComplete = (progress: Pick<Progress, 'visited'>) =>
  LOCATION_IDS.every((id) => progress.visited.includes(id));

export const mainQuestStatus = (progress: Pick<Progress, 'visited'>): QuestStatus => {
  if (isMainQuestComplete(progress)) return 'completed';
  return progress.visited.length > 0 ? 'active' : 'available';
};

export const mainQuestObjectives = (progress: Pick<Progress, 'visited'>) =>
  LOCATION_IDS.map((locationId: LocationId) => ({
    locationId,
    isDone: progress.visited.includes(locationId),
  }));

export const projectQuestStatus = (
  progress: Pick<Progress, 'questsRead'>,
  questId: string,
): ProjectQuestStatus => (progress.questsRead.includes(questId) ? 'read' : 'new');
