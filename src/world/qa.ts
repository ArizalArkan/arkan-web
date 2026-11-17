// Deterministic mode for tests (ARCHITECTURE.md §11): ?qa=1 freezes the
// world clock and turns off randomness. It never changes game rules.

const isQa = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('qa');

export const qa = {
  enabled: isQa,
  /** Sprite animation, flicker and particles hold still. */
  freeze: isQa,
};
