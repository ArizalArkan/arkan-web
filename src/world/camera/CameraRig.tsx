import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { MathUtils, type PerspectiveCamera } from 'three';
import { world } from '@/content/world';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { cameraState, heroBody } from '../systems/heroState';
import { camera as cameraTheme } from '../theme';

const PITCH = MathUtils.degToRad(cameraTheme.pitchDeg);
/** Hero is about 1/8 of the screen height at this distance (DESIGN.md §8.1). */
const BASE_DISTANCE = 24;
/** In portrait the camera backs off until at least this many tiles fit across. */
const MIN_TILES_ACROSS = 8;
const HALF_FOV_TAN = Math.tan(MathUtils.degToRad(cameraTheme.fov / 2));
/** Aim a little above the feet so the hero sits just below center. */
const LOOK_HEIGHT = 1;

const target = { x: 0, z: 0 };

/**
 * Follow camera: fixed yaw and pitch, damped position, clamped to the town.
 * One owner at a time: it stands down while cameraMode is 'cinematic'.
 */
export function CameraRig() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;

  useEffect(() => {
    camera.rotation.set(-PITCH, 0, 0);
    cameraState.snap = true;
  }, [camera]);

  useFrame((state, delta) => {
    if (usePlayerStore.getState().cameraMode === 'cinematic') return;

    const aspect = state.size.width / state.size.height;
    // Narrow screens: pull back so the visible width never drops below 8 tiles,
    // and a further 15% on phones (DESIGN.md §9).
    const widthDistance = MIN_TILES_ACROSS / (2 * HALF_FOV_TAN * aspect);
    const distance = Math.max(BASE_DISTANCE * (state.size.width < 768 ? 1.15 : 1), widthDistance);

    // Stop at the edge of town instead of showing the void beyond it.
    const halfViewW = distance * HALF_FOV_TAN * aspect;
    const maxX = Math.max(0, world.size.w / 2 - halfViewW * 0.75);
    const goalX = MathUtils.clamp(heroBody.x, -maxX, maxX);
    const goalZ = MathUtils.clamp(heroBody.z, -world.size.d / 2 + 5, world.size.d / 2 - 4);

    if (cameraState.snap) {
      target.x = goalX;
      target.z = goalZ;
      cameraState.snap = false;
    } else {
      // Frame-rate independent damping (DESIGN.md §7: lerp, never snap).
      const t = 1 - Math.pow(1 - cameraTheme.followDamping, delta * 60);
      target.x += (goalX - target.x) * t;
      target.z += (goalZ - target.z) * t;
    }

    camera.position.set(
      target.x,
      LOOK_HEIGHT + Math.sin(PITCH) * distance,
      target.z + Math.cos(PITCH) * distance,
    );
  });

  return null;
}
