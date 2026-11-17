import { create } from 'zustand';
import type { LocationId } from '@/content/schema';

export type InputDevice = 'keyboard' | 'pointer' | 'touch';
export type CameraMode = 'follow' | 'cinematic';

export type Interactable = {
  id: string;
  label: string;
  prompt: string;
  kind: 'location' | 'npc' | 'sign';
};

type PlayerState = {
  /** Keyboard direction on the ground plane, each axis -1..1. Read in useFrame. */
  moveDir: { x: number; z: number };
  /** Tap/click destination on the ground, or null. */
  moveTarget: { x: number; z: number } | null;
  /** Interactable to trigger once the hero arrives at moveTarget. */
  pendingInteract: string | null;
  zone: LocationId | null;
  active: Interactable | null;
  inputDevice: InputDevice;
  cameraMode: CameraMode;
  /** Fast Travel request; the world consumes it and clears it. */
  travel: { locationId: LocationId; openOnArrival: boolean } | null;
  isTransitioning: boolean;
  setMoveDir: (x: number, z: number) => void;
  setMoveTarget: (target: { x: number; z: number } | null, interactId?: string | null) => void;
  setZone: (zone: LocationId | null) => void;
  setActive: (active: Interactable | null) => void;
  setInputDevice: (device: InputDevice) => void;
  setCameraMode: (mode: CameraMode) => void;
  requestTravel: (locationId: LocationId, openOnArrival?: boolean) => boolean;
  finishTravel: () => void;
  setTransitioning: (value: boolean) => void;
};

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  moveDir: { x: 0, z: 0 },
  moveTarget: null,
  pendingInteract: null,
  zone: null,
  active: null,
  inputDevice: 'keyboard',
  cameraMode: 'follow',
  travel: null,
  isTransitioning: false,

  setMoveDir(x, z) {
    const current = get().moveDir;
    if (current.x === x && current.z === z) return;
    // Keyboard input cancels a pending tap-to-move.
    set(
      x !== 0 || z !== 0
        ? { moveDir: { x, z }, moveTarget: null, pendingInteract: null }
        : { moveDir: { x, z } },
    );
  },
  setMoveTarget: (target, interactId = null) =>
    set({ moveTarget: target, pendingInteract: interactId }),
  setZone: (zone) => {
    if (get().zone !== zone) set({ zone });
  },
  setActive: (active) => {
    if (get().active?.id !== active?.id) set({ active });
  },
  setInputDevice: (inputDevice) => {
    if (get().inputDevice !== inputDevice) set({ inputDevice });
  },
  setCameraMode: (cameraMode) => set({ cameraMode }),
  // Ignored while a transition runs, so Fast Travel cannot fire twice (QA §5.4).
  requestTravel(locationId, openOnArrival = true) {
    if (get().isTransitioning) return false;
    set({ travel: { locationId, openOnArrival }, moveTarget: null, pendingInteract: null });
    return true;
  },
  finishTravel: () => set({ travel: null }),
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
}));
