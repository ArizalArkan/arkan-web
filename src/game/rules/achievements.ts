// Achievements (PRODUCT.md §7.3). `isMet` reads progress only; `isAttainable`
// says whether the current content makes the badge possible at all, so an
// empty collectible list never hands out Treasure Hunter for free.

import type { Progress } from './progress';

type Catalog = {
  locations: readonly string[];
  quests: readonly string[];
  npcs: readonly string[];
  collectibles: readonly string[];
};

export type AchievementDef = {
  name: string;
  /** Shown before unlock. Secret badges show "???" and a vague hint. */
  requirement: string;
  isSecret: boolean;
  xp: number;
  isMet: (progress: Progress, catalog: Catalog) => boolean;
  isAttainable: (catalog: Catalog) => boolean;
};

const always = () => true;
const hasAll = (have: readonly string[], need: readonly string[]) =>
  need.length > 0 && need.every((id) => have.includes(id));

export const ACHIEVEMENTS = {
  'first-steps': {
    name: 'First Steps',
    requirement: 'Take your first step in town.',
    isSecret: false,
    xp: 10,
    // Unlocked directly by the movement system, never derived.
    isMet: () => false,
    isAttainable: always,
  },
  'town-explorer': {
    name: 'Town Explorer',
    requirement: 'Visit every location in town.',
    isSecret: false,
    xp: 100,
    isMet: (p, c) => hasAll(p.visited, c.locations),
    isAttainable: always,
  },
  'quest-reader': {
    name: 'Quest Reader',
    requirement: 'Read 3 quests on the Quest Board.',
    isSecret: false,
    xp: 50,
    isMet: (p) => p.questsRead.length >= 3,
    isAttainable: (c) => c.quests.length >= 3,
  },
  completionist: {
    name: 'Completionist',
    requirement: 'Read every quest on the Quest Board.',
    isSecret: false,
    xp: 100,
    isMet: (p, c) => hasAll(p.questsRead, c.quests),
    isAttainable: (c) => c.quests.length > 0,
  },
  'social-butterfly': {
    name: 'Social Butterfly',
    requirement: 'Talk to everyone in town.',
    isSecret: false,
    xp: 50,
    isMet: (p, c) => hasAll(p.npcsMet, c.npcs),
    isAttainable: (c) => c.npcs.length > 0,
  },
  'treasure-hunter': {
    name: 'Treasure Hunter',
    requirement: 'Find every hidden coin.',
    isSecret: false,
    xp: 100,
    isMet: (p, c) => hasAll(p.collectibles, c.collectibles),
    isAttainable: (c) => c.collectibles.length > 0,
  },
  'pen-pal': {
    name: 'Pen Pal',
    requirement: 'Send a letter from the Post Office.',
    isSecret: false,
    xp: 50,
    isMet: (p) => p.contactSent,
    isAttainable: always,
  },
} satisfies Record<string, AchievementDef>;

export type AchievementId = keyof typeof ACHIEVEMENTS;

export const ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENTS) as AchievementId[];

/** Badges whose condition is met but are not yet unlocked. */
export const newlyMetAchievements = (progress: Progress, catalog: Catalog): AchievementId[] =>
  ACHIEVEMENT_IDS.filter(
    (id) =>
      !progress.achievements.includes(id) &&
      ACHIEVEMENTS[id].isAttainable(catalog) &&
      ACHIEVEMENTS[id].isMet(progress, catalog),
  );
