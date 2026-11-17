// XP and level math (PRODUCT.md §7.1). Pure functions, no state.

export const XP = {
  visitLocation: 50,
  readQuest: 30,
  openLink: 10,
  meetNpc: 10,
  collect: 15,
  sendContact: 100,
} as const;

export const MAX_LEVEL = 5;

/** Total XP needed to reach `level`: 100 x (L - 1) x L / 2. */
export const xpForLevel = (level: number) => (100 * (level - 1) * level) / 2;

export const levelFromXp = (xp: number) => {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level += 1;
  return level;
};

/** Progress inside the current level, for the HUD bar. */
export const levelProgress = (xp: number) => {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceiling = level >= MAX_LEVEL ? floor : xpForLevel(level + 1);
  return {
    level,
    current: xp - floor,
    needed: ceiling - floor,
    isMax: level >= MAX_LEVEL,
  };
};
