import { quests } from '@/content/quests';
import { LOCATION_IDS, type LocationId } from '@/content/schema';
import { world } from '@/content/world';
import { ACHIEVEMENTS, type AchievementId } from './achievements';
import { levelFromXp, XP } from './xp';

/**
 * Everything the visitor has done. XP is never stored as a running total in
 * logic: it is derived from these sets, which makes every reward idempotent
 * by construction and lets two tabs merge their saves safely.
 */
export type Progress = {
  visited: LocationId[];
  questsRead: string[];
  /** `${questId}#${linkIndex}` */
  linksOpened: string[];
  npcsMet: string[];
  collectibles: string[];
  achievements: AchievementId[];
  contactSent: boolean;
};

export const emptyProgress = (): Progress => ({
  visited: [],
  questsRead: [],
  linksOpened: [],
  npcsMet: [],
  collectibles: [],
  achievements: [],
  contactSent: false,
});

/** Content the world currently ships. Collectibles arrive with G-04 (P1). */
export const catalog = {
  locations: [...LOCATION_IDS] as LocationId[],
  quests: quests.map((quest) => quest.id),
  links: quests.flatMap((quest) => quest.links.map((_, index) => `${quest.id}#${index}`)),
  npcs: world.npcs.map((npc) => npc.id),
  collectibles: [] as string[],
};

export const computeXp = (progress: Progress) =>
  progress.visited.length * XP.visitLocation +
  progress.questsRead.length * XP.readQuest +
  progress.linksOpened.length * XP.openLink +
  progress.npcsMet.length * XP.meetNpc +
  progress.collectibles.length * XP.collect +
  progress.achievements.reduce((sum, id) => sum + ACHIEVEMENTS[id].xp, 0) +
  (progress.contactSent ? XP.sendContact : 0);

/** Highest XP the current content allows, and the level it reaches. */
export const maxXp = () =>
  computeXp({
    visited: catalog.locations,
    questsRead: catalog.quests,
    linksOpened: catalog.links,
    npcsMet: catalog.npcs,
    collectibles: catalog.collectibles,
    achievements: (Object.keys(ACHIEVEMENTS) as AchievementId[]).filter((id) =>
      ACHIEVEMENTS[id].isAttainable(catalog),
    ),
    contactSent: true,
  });

export const designedMaxLevel = () => levelFromXp(maxXp());

/** Drop ids the current content does not know, e.g. from an old or edited save. */
export const sanitizeProgress = (input: Progress): Progress => {
  const keep = <T extends string>(values: T[], allowed: readonly string[]) =>
    [...new Set(values)].filter((value) => allowed.includes(value));
  return {
    visited: keep(input.visited, catalog.locations),
    questsRead: keep(input.questsRead, catalog.quests),
    linksOpened: keep(input.linksOpened, catalog.links),
    npcsMet: keep(input.npcsMet, catalog.npcs),
    collectibles: keep(input.collectibles, catalog.collectibles),
    achievements: keep(input.achievements, Object.keys(ACHIEVEMENTS)),
    contactSent: input.contactSent === true,
  };
};

/** Union of two saves from the same reset epoch (two open tabs). */
export const mergeProgress = (a: Progress, b: Progress): Progress =>
  sanitizeProgress({
    visited: [...a.visited, ...b.visited],
    questsRead: [...a.questsRead, ...b.questsRead],
    linksOpened: [...a.linksOpened, ...b.linksOpened],
    npcsMet: [...a.npcsMet, ...b.npcsMet],
    collectibles: [...a.collectibles, ...b.collectibles],
    achievements: [...a.achievements, ...b.achievements],
    contactSent: a.contactSent || b.contactSent,
  });
