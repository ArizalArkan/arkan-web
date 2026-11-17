import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { analytics } from '@/services/analytics';
import { audio } from '@/services/audio';
import { startGameEffects } from './effects';
import { events } from './events';
import { usePlayerStore } from './stores/usePlayerStore';
import { useUIStore } from './stores/useUIStore';

describe('game effects', () => {
  let stop: () => void;
  beforeEach(() => {
    useUIStore.setState({ toasts: [] });
    stop = startGameEffects();
  });
  afterEach(() => {
    stop();
    vi.restoreAllMocks();
  });

  it('turns level-ups and achievements into toasts, sound and analytics', () => {
    const play = vi.spyOn(audio, 'play');
    const track = vi.spyOn(analytics, 'track');
    events.emit({ type: 'levelUp', level: 3 });
    events.emit({ type: 'achievement', id: 'pen-pal', name: 'Pen Pal' });
    expect(useUIStore.getState().toasts.map((toast) => toast.title)).toEqual([
      'Level up: LV 3',
      'New badge: Pen Pal',
    ]);
    expect(play).toHaveBeenCalledTimes(2);
    expect(track).toHaveBeenCalledWith('achievement_unlocked', { id: 'pen-pal' });
  });

  it('tracks visits and quest reads without toasts of their own', () => {
    const track = vi.spyOn(analytics, 'track');
    events.emit({ type: 'locationVisited', locationId: 'armory' });
    events.emit({ type: 'questRead', questId: 'bank-saqu' });
    events.emit({ type: 'mainQuestComplete' });
    expect(track).toHaveBeenCalledWith('location_visited', { id: 'armory' });
    expect(track).toHaveBeenCalledWith('quest_opened', { id: 'bank-saqu' });
    expect(useUIStore.getState().toasts).toEqual([]);
  });

  it('stops listening after cleanup', () => {
    stop();
    events.emit({ type: 'levelUp', level: 2 });
    expect(useUIStore.getState().toasts).toEqual([]);
    stop = () => undefined;
  });
});

describe('remaining store actions', () => {
  it('ui: modal and banner', () => {
    const ui = useUIStore.getState();
    ui.openModal('reset-confirm');
    expect(useUIStore.getState().modal).toBe('reset-confirm');
    ui.closeModal();
    ui.showBanner('library');
    expect(useUIStore.getState()).toMatchObject({ modal: null, banner: 'library' });
    ui.clearBanner();
    ui.openDialog('guide-intro');
    expect(useUIStore.getState().dialog).toEqual({
      dialogId: 'guide-intro',
      npcId: null,
      isRepeat: false,
    });
    ui.closeDialog();
    expect(useUIStore.getState()).toMatchObject({ banner: null, dialog: null });
  });

  it('player: zone, active, device, camera, travel', () => {
    const player = usePlayerStore.getState();
    player.setZone('armory');
    player.setZone('armory');
    player.setActive({ id: 'armory', label: 'Armory', prompt: 'Enter Armory', kind: 'location' });
    player.setInputDevice('touch');
    player.setCameraMode('cinematic');
    player.setMoveDir(0, 0);
    expect(usePlayerStore.getState()).toMatchObject({
      zone: 'armory',
      active: { id: 'armory' },
      inputDevice: 'touch',
      cameraMode: 'cinematic',
    });
    player.setTransitioning(false);
    player.requestTravel('library', false);
    expect(usePlayerStore.getState().travel).toEqual({
      locationId: 'library',
      openOnArrival: false,
      isCommitted: false,
    });
    player.commitTravel();
    expect(usePlayerStore.getState().travel?.isCommitted).toBe(true);
    player.requestInteract();
    player.showBlockedTap(1, 2);
    expect(usePlayerStore.getState()).toMatchObject({
      interactNonce: 1,
      blockedTap: { x: 1, z: 2, nonce: 1 },
    });
    player.finishTravel();
    expect(usePlayerStore.getState().travel).toBeNull();
  });
});
