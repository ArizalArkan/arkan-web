import { world } from '@/content/world';
import type { Tier } from '@/game/stores/useSettingsStore';
import { lighting, tiers } from '../theme';

type LightingProps = { tier: Tier };

// The shadow frustum covers the whole town once, so it never has to follow
// the camera and shadows never swim as the hero walks.
const HALF_W = world.size.w / 2 + 4;
const HALF_D = world.size.d / 2 + 6;

/**
 * Dusk (DESIGN.md §3.5): a cool indigo ambient, one moon key light that owns
 * the only shadow map, and fog that melts the edge of town into the page
 * background. Warmth comes from the lanterns, so the eye follows the light.
 */
export function Lighting({ tier }: LightingProps) {
  const shadowMap = tiers[tier].shadowMap;
  return (
    <>
      <color attach="background" args={[lighting.fogFar]} />
      <fog attach="fog" args={[lighting.fogFar, lighting.fogStart, lighting.fogEnd]} />
      <hemisphereLight
        args={[lighting.hemisphereSky, lighting.hemisphereGround, lighting.hemisphereIntensity]}
      />
      <directionalLight
        color={lighting.keyLight}
        intensity={lighting.keyIntensity}
        position={lighting.keyPosition}
        castShadow={shadowMap > 0}
        shadow-mapSize={[shadowMap || 1, shadowMap || 1]}
        shadow-bias={-0.004}
        shadow-normalBias={0.12}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-HALF_W, HALF_W, HALF_D, -HALF_D, 1, 80]}
        />
      </directionalLight>
    </>
  );
}
