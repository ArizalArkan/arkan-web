import type { CSSProperties } from 'react';

type AtmosphereProps = {
  /** Where the light comes from, as a CSS x position. */
  raysFrom?: string;
  fireflies?: number;
  /** Seed so each scene scatters its fireflies differently, but the same every visit. */
  seed?: number;
  fog?: boolean;
};

const scatter = (seed: number, index: number) => {
  const value = Math.sin(seed * 9301 + index * 49297) * 233280;
  return value - Math.floor(value);
};

/** HD layer over a pixel scene: light shafts, drifting fog, fireflies, vignette. */
export function Atmosphere({
  raysFrom = '80%',
  fireflies = 8,
  seed = 1,
  fog = true,
}: AtmosphereProps) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="qr-rays" style={{ '--rays-x': raysFrom } as CSSProperties} />
      {fog ? <div className="qr-fog" style={{ bottom: '8%' }} /> : null}
      {Array.from({ length: fireflies }, (_, index) => {
        const r = (offset: number) => scatter(seed, index * 7 + offset);
        return (
          <span
            key={index}
            className="qr-firefly"
            style={
              {
                left: `${6 + r(1) * 88}%`,
                top: `${35 + r(2) * 55}%`,
                '--float-x': `${Math.round(r(3) * 40 - 20)}px`,
                '--float-y': `${Math.round(-10 - r(4) * 30)}px`,
                '--float-s': `${(5 + r(5) * 5).toFixed(1)}s`,
                '--float-delay': `${(-r(6) * 6).toFixed(1)}s`,
              } as CSSProperties
            }
          />
        );
      })}
      <div className="qr-vignette" />
    </div>
  );
}
