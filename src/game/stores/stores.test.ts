import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SAVE_KEY, saveService } from '@/services/save';
import { startGameEffects } from '../effects';
import { events } from '../events';
import { emptyProgress } from '../rules/progress';
import { useGameStore, startPersistence } from './useGameStore';
import { usePlayerStore } from './usePlayerStore';
import { selectReducedMotion, selectTier, useSettingsStore } from './useSettingsStore';
import { selectIsWorldBlocked, useUIStore } from './useUIStore';

const resetStores = () => {
  useGameStore.setState({ ...emptyProgress(), xp: 0, epoch: 0 });
  useUIStore.setState({
    window: null,
    questId: null,
    modal: null,
    dialog: null,
    toasts: [],
    banner: null,
  });
  usePlayerStore.setState({
    travel: null,
    isTransitioning: false,
    moveTarget: null,
    moveDir: { x: 0, z: 0 },
  });
};

describe('game store', () => {
  let stopEffects: () => void;
  beforeEach(() => {
    resetStores();
    stopEffects = startGameEffects();
  });
  afterEach(() => {
    stopEffects();
    events.clear();
  });

  it('visitLocation is idempotent and drives a toast', () => {
    const { visitLocation } = useGameStore.getState();
    visitLocation('guild-hall');
    visitLocation('guild-hall');
    expect(useGameStore.getState().xp).toBe(50);
    expect(useUIStore.getState().toasts).toEqual([
      expect.objectContaining({ kind: 'xp', amount: 50 }),
    ]);
  });

  it('merges back-to-back XP toasts', () => {
    useGameStore.getState().readQuest('bank-saqu');
    useGameStore.getState().openLink('bank-saqu', 0);
    expect(useUIStore.getState().toasts).toEqual([
      expect.objectContaining({ title: '+40 XP', amount: 40 }),
    ]);
  });

  it('reset clears progress and bumps the epoch', () => {
    useGameStore.getState().visitLocation('armory');
    useGameStore.getState().resetProgress();
    expect(useGameStore.getState()).toMatchObject({ visited: [], xp: 0, epoch: 1 });
  });
});

describe('persistence', () => {
  let stop: () => void;
  beforeEach(() => {
    resetStores();
    stop = startPersistence();
  });
  afterEach(() => stop());

  it('writes progress and settings to storage', () => {
    useGameStore.getState().visitLocation('library');
    useSettingsStore.getState().setSound(true);
    const saved = saveService.load();
    expect(saved).toMatchObject({ visited: ['library'], xp: 50, settings: { sound: true } });
  });

  it('merges progress saved by another tab', () => {
    useGameStore.getState().visitLocation('library');
    const other = { ...saveService.load(), visited: ['armory'] };
    window.dispatchEvent(
      new StorageEvent('storage', { key: SAVE_KEY, newValue: JSON.stringify(other) }),
    );
    expect(useGameStore.getState().visited.sort()).toEqual(['armory', 'library']);
  });

  it('a reset in another tab wins over local progress', () => {
    useGameStore.getState().visitLocation('library');
    const reset = { ...saveService.load(), epoch: 5, visited: [] };
    window.dispatchEvent(
      new StorageEvent('storage', { key: SAVE_KEY, newValue: JSON.stringify(reset) }),
    );
    expect(useGameStore.getState()).toMatchObject({ visited: [], epoch: 5, xp: 0 });
  });

  it('ignores stale epochs and other keys', () => {
    useGameStore.setState({ epoch: 3 });
    useGameStore.getState().visitLocation('library');
    const stale = { ...saveService.load(), epoch: 1, visited: ['armory'] };
    window.dispatchEvent(
      new StorageEvent('storage', { key: SAVE_KEY, newValue: JSON.stringify(stale) }),
    );
    window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: '{}' }));
    expect(useGameStore.getState().visited).toEqual(['library']);
  });
});

describe('settings store', () => {
  it('manual quality beats the automatic tier', () => {
    useSettingsStore.setState({ quality: 'auto', autoTier: 'high' });
    expect(useSettingsStore.getState().lowerAutoTier()).toBe(true);
    expect(selectTier(useSettingsStore.getState())).toBe('medium');
    useSettingsStore.getState().setQuality('high');
    expect(selectTier(useSettingsStore.getState())).toBe('high');
  });

  it('auto tier stops at low and high', () => {
    useSettingsStore.setState({ autoTier: 'low' });
    expect(useSettingsStore.getState().lowerAutoTier()).toBe(false);
    useSettingsStore.setState({ autoTier: 'high' });
    expect(useSettingsStore.getState().raiseAutoTier()).toBe(false);
  });

  it('reduced motion follows the OS unless overridden', () => {
    useSettingsStore.setState({ reducedMotionOverride: null, systemReducedMotion: true });
    expect(selectReducedMotion(useSettingsStore.getState())).toBe(true);
    useSettingsStore.getState().setReducedMotion(false);
    expect(selectReducedMotion(useSettingsStore.getState())).toBe(false);
  });

  it('setMode can skip remembering', () => {
    useSettingsStore.setState({ savedMode: null });
    useSettingsStore.getState().setMode('quick', { remember: false });
    expect(useSettingsStore.getState()).toMatchObject({ mode: 'quick', savedMode: null });
  });
});

describe('ui store', () => {
  beforeEach(resetStores);

  it('opening a quest opens the board on its detail page; back returns to the list', () => {
    useUIStore.getState().openQuest('altaraone');
    expect(useUIStore.getState()).toMatchObject({ window: 'quest-board', questId: 'altaraone' });
    useUIStore.getState().closeQuest();
    expect(useUIStore.getState()).toMatchObject({ window: 'quest-board', questId: null });
  });

  it('blocks world input while a window, modal or dialog is open', () => {
    expect(selectIsWorldBlocked(useUIStore.getState())).toBe(false);
    useUIStore.getState().openDialog('guide-intro', 'wren');
    expect(selectIsWorldBlocked(useUIStore.getState())).toBe(true);
    useUIStore.getState().openWindow('armory');
    expect(useUIStore.getState().dialog).toBeNull();
    useUIStore.getState().closeWindow();
    expect(selectIsWorldBlocked(useUIStore.getState())).toBe(false);
  });

  it('queues and dismisses toasts', () => {
    useUIStore.getState().pushToast({ kind: 'info', title: 'A' });
    useUIStore.getState().pushToast({ kind: 'error', title: 'B' });
    const [first] = useUIStore.getState().toasts;
    useUIStore.getState().dismissToast(first!.id);
    expect(useUIStore.getState().toasts.map((toast) => toast.title)).toEqual(['B']);
  });
});

describe('player store', () => {
  beforeEach(resetStores);

  it('ignores Fast Travel requests during a transition', () => {
    expect(usePlayerStore.getState().requestTravel('armory')).toBe(true);
    usePlayerStore.getState().setTransitioning(true);
    expect(usePlayerStore.getState().requestTravel('library')).toBe(false);
    expect(usePlayerStore.getState().travel?.locationId).toBe('armory');
  });

  it('keyboard movement cancels tap-to-move', () => {
    usePlayerStore.getState().setMoveTarget({ x: 1, z: 1 }, 'armory');
    usePlayerStore.getState().setMoveDir(1, 0);
    expect(usePlayerStore.getState()).toMatchObject({ moveTarget: null, pendingInteract: null });
  });
});
