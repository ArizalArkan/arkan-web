// Id lists used at runtime. Kept free of zod so importing them does not pull
// the schema library into the shell bundle (schemas only run in tests).

export const LOCATION_IDS = [
  'guild-hall',
  'quest-board',
  'armory',
  'library',
  'post-office',
] as const;
export type LocationId = (typeof LOCATION_IDS)[number];

export const WINDOW_IDS = [
  'guild-hall',
  'quest-board',
  'quest-detail',
  'armory',
  'library',
  'post-office',
  'fast-travel',
  'quest-log',
  'settings',
] as const;
export type WindowId = (typeof WINDOW_IDS)[number];

export const RARITIES = ['common', 'rare', 'epic', 'legendary'] as const;
export type Rarity = (typeof RARITIES)[number];

export const SKILL_SLOTS = ['frontend', 'backend', 'database', 'tools'] as const;
export type SkillSlot = (typeof SKILL_SLOTS)[number];
