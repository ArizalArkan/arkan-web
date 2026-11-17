import { create } from 'zustand';
import { saveService } from '@/services/save';
import type { Mode } from '../rules/mode';

export type Quality = 'auto' | 'high' | 'medium' | 'low';
export type Tier = 'high' | 'medium' | 'low';

const TIER_ORDER: Tier[] = ['low', 'medium', 'high'];

type SettingsState = {
  /** Mode in use right now. */
  mode: Mode;
  /** Mode the visitor chose explicitly; null until they pick one. */
  savedMode: Mode | null;
  quality: Quality;
  /** Tier the renderer uses; follows `quality` unless it is `auto`. */
  autoTier: Tier;
  sound: boolean;
  /** null = follow the OS `prefers-reduced-motion`. */
  reducedMotionOverride: boolean | null;
  systemReducedMotion: boolean;
  setMode: (mode: Mode, options?: { remember?: boolean }) => void;
  setQuality: (quality: Quality) => void;
  lowerAutoTier: () => boolean;
  raiseAutoTier: () => boolean;
  setSound: (sound: boolean) => void;
  setReducedMotion: (value: boolean | null) => void;
  setSystemReducedMotion: (value: boolean) => void;
};

const saved = saveService.load().settings;

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  mode: saved.mode ?? 'adventure',
  savedMode: saved.mode,
  quality: saved.quality,
  autoTier: 'high',
  sound: saved.sound,
  reducedMotionOverride: saved.reducedMotion,
  systemReducedMotion: false,

  setMode: (mode, { remember = true } = {}) => set(remember ? { mode, savedMode: mode } : { mode }),
  setQuality: (quality) => set({ quality }),
  lowerAutoTier() {
    const index = TIER_ORDER.indexOf(get().autoTier);
    if (index <= 0) return false;
    set({ autoTier: TIER_ORDER[index - 1] });
    return true;
  },
  raiseAutoTier() {
    const index = TIER_ORDER.indexOf(get().autoTier);
    if (index >= TIER_ORDER.length - 1) return false;
    set({ autoTier: TIER_ORDER[index + 1] });
    return true;
  },
  setSound: (sound) => set({ sound }),
  setReducedMotion: (value) => set({ reducedMotionOverride: value }),
  setSystemReducedMotion: (value) => set({ systemReducedMotion: value }),
}));

/** A manual quality choice always beats the automatic tier (ARCHITECTURE.md §10.2). */
export const selectTier = (state: Pick<SettingsState, 'quality' | 'autoTier'>): Tier =>
  state.quality === 'auto' ? state.autoTier : state.quality;

export const selectReducedMotion = (
  state: Pick<SettingsState, 'reducedMotionOverride' | 'systemReducedMotion'>,
) => state.reducedMotionOverride ?? state.systemReducedMotion;
