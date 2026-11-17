// Typewriter timing (DESIGN.md §7): 30 ms per character, 150 ms after . ! ?
// and 80 ms after a comma.

export const delayAfter = (char: string, baseMs: number) => {
  if (char === '.' || char === '!' || char === '?') return 150;
  if (char === ',') return 80;
  return baseMs;
};
