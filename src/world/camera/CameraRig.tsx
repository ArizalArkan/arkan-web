import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Fog, MathUtils, type PerspectiveCamera } from 'three';
import { world } from '@/content/world';
import { cameraState, heroBody } from '../systems/heroState';
import { camera as cameraTheme, lighting } from '../theme';

const PITCH = MathUtils.degToRad(cameraTheme.pitchDeg);
/** Hero is about 1/8 of the screen height at this distance (DESIGN.md §8.1). */
const BASE_DISTANCE = 20;
/** In portrait the camera backs off until at least this many tiles fit across. */
const MIN_TILES_ACROSS = 8;
const HALF_FOV_TAN = Math.tan(MathUtils.degToRad(cameraTheme.fov / 2));
/** Aim a little above the feet so the hero sits just below center. */
const LOOK_HEIGHT = 1;

const target = { x: 0, z: 0 };

/**
 * Follow camera: fixed yaw, damped position, clamped to the town. Cinematics
 * (the intro) never move the camera themselves: they tween cameraState.zoom
 * and extraPitchDeg, so there is always exactly one owner of the camera.
 */
export function CameraRig() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;

  useEffect(() => {
    camera.rotation.set(-PITCH, 0, 0);
    cameraState.snap = true;
  }, [camera]);

  useFrame((state, delta) => {
    const aspect = state.size.width / state.size.height;
    // Narrow screens: pull back so the visible width never drops below 8 tiles,
    // and a further 15% on phones (DESIGN.md §9).
    const widthDistance = MIN_TILES_ACROSS / (2 * HALF_FOV_TAN * aspect);
    const distance =
      Math.max(BASE_DISTANCE * (state.size.width < 768 ? 1.15 : 1), widthDistance) *
      cameraState.zoom;
    const pitch = PITCH + MathUtils.degToRad(cameraState.extraPitchDeg);

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

    // Fog is measured from the camera, so it has to back off with it or a
    // pulled-back shot (the intro, portrait phones) drowns in haze.
    const fog = state.scene.fog;
    if (fog instanceof Fog) {
      const scale = distance / BASE_DISTANCE;
      fog.near = lighting.fogStart * scale;
      fog.far = lighting.fogEnd * scale;
    }

    camera.rotation.x = -pitch;
    camera.position.set(
      target.x,
      LOOK_HEIGHT + Math.sin(pitch) * distance,
      target.z + Math.cos(pitch) * distance,
    );
  });

  return null;
}
