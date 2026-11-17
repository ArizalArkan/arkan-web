export type HeadingLevel = 1 | 2 | 3 | 4;

/** One level deeper, capped at h4. */
export const nextLevel = (level: HeadingLevel): HeadingLevel =>
  Math.min(4, level + 1) as HeadingLevel;
