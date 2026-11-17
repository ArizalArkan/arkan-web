// Initial mode (ARCHITECTURE.md §4.1), in priority order:
// URL ?mode= > saved preference > capability fallbacks > adventure.

export type Mode = 'adventure' | 'quick';

export type ModeInputs = {
  urlMode: string | null;
  savedMode: Mode | null;
  hasWebgl: boolean;
  prefersReducedMotion: boolean;
  saveData: boolean;
};

export const isMode = (value: unknown): value is Mode => value === 'adventure' || value === 'quick';

export const resolveInitialMode = (inputs: ModeInputs): { mode: Mode; reason: string } => {
  // Without WebGL there is nothing to render, whatever was asked for.
  if (!inputs.hasWebgl) return { mode: 'quick', reason: 'no-webgl' };
  if (isMode(inputs.urlMode)) return { mode: inputs.urlMode, reason: 'url' };
  if (inputs.savedMode) return { mode: inputs.savedMode, reason: 'saved' };
  if (inputs.prefersReducedMotion) return { mode: 'quick', reason: 'reduced-motion' };
  if (inputs.saveData) return { mode: 'quick', reason: 'save-data' };
  return { mode: 'adventure', reason: 'default' };
};
