// Deterministic mode for tests (ARCHITECTURE.md §11): ?qa=1 freezes the
// world clock and turns off randomness. It never changes game rules.

const params =
  typeof window === 'undefined'
    ? new URLSearchParams()
    : new URLSearchParams(window.location.search);
const isQa = params.has('qa');
const forcedTier = params.get('quality');

export const qa = {
  enabled: isQa,
  /** Sprite animation, flicker and particles hold still. */
  freeze: isQa,
  /** ?quality=high|medium|low pins the tier for this visit (visual tests V03/V04). */
  tier: (forcedTier === 'high' || forcedTier === 'medium' || forcedTier === 'low'
    ? forcedTier
    : null) as 'high' | 'medium' | 'low' | null,
};
