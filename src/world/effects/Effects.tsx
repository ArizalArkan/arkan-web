import {
  Bloom,
  EffectComposer,
  TiltShift2,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { useThree } from '@react-three/fiber';
import { ToneMappingMode } from 'postprocessing';
import type { Tier } from '@/game/stores/useSettingsStore';
import { tiers } from '../theme';

type EffectsProps = { tier: Tier };

/**
 * The HD layer (DESIGN.md §8.1): tilt-shift blur toward the top and bottom
 * edges so the town reads as a miniature, bloom that only the lanterns,
 * windows and markers are bright enough to trigger, and a soft vignette.
 * The low tier renders nothing here, and the scene must still look right.
 */
export function Effects({ tier }: EffectsProps) {
  const settings = tiers[tier];
  // On tall screens the same blur would smear most of the town, so it eases off.
  const aspect = useThree((state) => state.size.width / state.size.height);
  const blurScale = Math.min(1, Math.max(0.3, aspect / 1.6));
  if (tier === 'low') return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <TiltShift2
        blur={settings.tiltShift * blurScale}
        taper={0.55}
        // Focus band runs left to right through the hero, just below center.
        start={[0, 0.54]}
        end={[1, 0.54]}
        samples={settings.tiltSamples}
      />
      <Bloom
        intensity={settings.bloom}
        luminanceThreshold={0.92}
        luminanceSmoothing={0.08}
        mipmapBlur
      />
      <Vignette darkness={settings.vignette} offset={0.35} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
