// Mirror of src/styles/tokens.css for Three.js (DESIGN.md §3, §3.5, §8.1).
// theme.test.ts fails if a palette value drifts from tokens.css.

export const palette = {
  night900: '#0f0b1e',
  night800: '#1a1433',
  night700: '#2a2150',
  dusk500: '#5b4b9e',
  dusk300: '#b9a9d9',
  parchment100: '#f4e8c8',
  parchment300: '#d9c594',
  ink900: '#1b1420',
  ink600: '#5a4630',
  gold400: '#f2c14e',
  gold600: '#c8902a',
  ember500: '#e8643c',
  hp500: '#d8434f',
  hp300: '#ff6b78',
  herb400: '#6bcb77',
  mana400: '#4fb8e8',
} as const;

export const lighting = {
  hemisphereSky: '#3b2f7a',
  hemisphereGround: palette.night800,
  /** Low but never black: the town stays readable away from the lanterns. */
  hemisphereIntensity: 4.2,
  keyLight: '#9fb4ff',
  keyIntensity: 1.5,
  /** Moon direction: high, from the south-west, so fronts catch the light. */
  keyPosition: [-14, 22, 12] as [number, number, number],
  lanternWarm: palette.ember500,
  lanternHot: palette.gold400,
  lanternIntensity: 14,
  lanternDistance: 8,
  lanternFlicker: 0.08,
  fogNear: palette.night900,
  fogFar: palette.night700,
  /** Fog starts past the hero and swallows the grass apron. */
  fogStart: 26,
  fogEnd: 52,
  /** Brightness boost for unlit glow sprites so they cross the bloom threshold. */
  glowBoost: 1.7,
} as const;

/** Post-processing and shadows per quality tier (DESIGN.md §9.1). */
export const tiers = {
  high: { shadowMap: 2048, bloom: 0.7, tiltShift: 0.22, tiltSamples: 10, vignette: 0.3 },
  medium: { shadowMap: 1024, bloom: 0.55, tiltShift: 0.14, tiltSamples: 5, vignette: 0.3 },
  // No composer at all: palette, composition and legibility must not depend on it.
  low: { shadowMap: 0, bloom: 0, tiltShift: 0, tiltSamples: 0, vignette: 0 },
} as const;

export const camera = {
  fov: 28,
  pitchDeg: 35,
  near: 0.1,
  far: 200,
  followDamping: 0.1,
} as const;

/** Texel density: 32 texels = 1 world unit (DESIGN.md §5.3). */
export const PPU = 32;

export const maxDpr = { desktop: 2, mobile: 1.5 } as const;
