import type { CSSProperties } from 'react';
import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
import { world } from '@/content/world';
import { formatRoute } from '@/lib/route';
import { analytics } from '@/services/analytics';
import { PixelButton } from '@/ui/primitives/PixelButton';
import { Atmosphere } from './Atmosphere';
import { GuideDialog } from './GuideDialog';
import { HeroStatus } from './HeroStatus';

const SCENE = '/assets/scene';

// Positions are in texels of the 480-wide near layer (scripts/lib/scene.mjs),
// measured from its centre, so the stage lines up at every scale.
const HERO_X = 210 - 240;
const WREN_X = 270 - 240;
const LANTERNS = [82 - 240, 308 - 240];
const LANTERN_HEIGHT = 60;

// Fixed so the sky is the same on every visit; kept to the side columns.
const STARS: [number, number][] = [
  [4, 12],
  [9, 34],
  [14, 8],
  [18, 52],
  [6, 70],
  [12, 88],
  [83, 14],
  [88, 42],
  [93, 22],
  [97, 60],
  [86, 76],
  [91, 94],
];

const atCentre = (texels: number): CSSProperties => ({
  left: `calc(50% + ${texels}px * var(--scene))`,
});

/**
 * Title card for Quick Read (DESIGN.md §8.5): the name and the two actions a
 * recruiter needs, over a small dusk diorama of the same town. The scene is
 * decoration and hidden from assistive tech; every fact is in the text.
 */
export function QuickReadHero() {
  const letters = [...profile.name];
  return (
    <header className="relative overflow-hidden bg-night-900" data-qr="hero">
      {STARS.map(([x, y]) => (
        <span
          key={`${x}-${y}`}
          className="qr-star"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(x * y) % 2400}ms` }}
          aria-hidden="true"
        />
      ))}

      <div className="relative mx-auto grid max-w-grid gap-8 px-4 pt-12 pb-8 md:pt-16 lg:grid-cols-[minmax(0,1fr)_calc(var(--px)*80)] lg:items-start">
        <div className="flex flex-col gap-4">
          <p className="font-ui text-ui-md text-dusk-300" data-qr="intro">
            {world.name}
          </p>
          <h1 className="pixel-text text-shadow-pixel font-display text-display-lg text-parchment-100 uppercase sm:text-display-xl">
            <span className="sr-only">{profile.name}</span>
            <span aria-hidden="true">
              {letters.map((letter, index) => (
                <span key={index} className="inline-block whitespace-pre" data-qr="letter">
                  {letter}
                </span>
              ))}
            </span>
          </h1>
          <p className="font-ui text-ui-lg text-gold-400" data-qr="intro">
            {profile.role} · {profile.location}
          </p>
          <p className="max-w-prose font-body text-body-lg text-parchment-100" data-qr="intro">
            {profile.tagline}
          </p>
          <div className="flex origin-top flex-wrap gap-3 pt-2" data-qr="cta-row">
            <PixelButton
              href={formatRoute({ kind: 'section', section: 'contact' })}
              iconLeft="letter"
            >
              {copy.actions.sendLetter}
            </PixelButton>
            {profile.cv ? (
              <PixelButton
                variant="secondary"
                href={profile.cv.href}
                download={profile.cv.fileName}
                iconLeft="download"
                onClick={() => analytics.track('cv_downloaded')}
              >
                {copy.actions.downloadCv}
              </PixelButton>
            ) : (
              <PixelButton variant="secondary" iconLeft="print" onClick={() => window.print()}>
                {copy.actions.printCv}
              </PixelButton>
            )}
          </div>
        </div>
        <HeroStatus />
      </div>

      <GuideDialog />

      <div className="qr-scene" aria-hidden="true" data-qr="scene">
        {/* Parallax moves the wrappers; the intro moves what is inside them.
            Two tweens on one element would fight over the same y. */}
        <div className="absolute inset-0" data-qr-depth="0.5">
          <img
            src={`${SCENE}/moon.png`}
            alt=""
            className="qr-moon"
            style={{ right: '14%', top: 'calc(6px * var(--scene))' }}
            data-qr="moon"
          />
        </div>
        <div className="absolute inset-0" data-qr-depth="0.3">
          <div
            className="qr-layer qr-dof-far"
            style={{ backgroundImage: `url(${SCENE}/far.png)` }}
            data-qr-layer="far"
          />
        </div>
        <div className="absolute inset-0" data-qr-depth="0.15">
          <div
            className="qr-layer qr-dof-mid"
            style={{ backgroundImage: `url(${SCENE}/mid.png)` }}
            data-qr-layer="mid"
          />
        </div>
        <div
          className="qr-layer"
          style={{ backgroundImage: `url(${SCENE}/ground.png)` }}
          data-qr-layer="ground"
        />
        <div
          className="qr-layer qr-layer-near"
          style={{ backgroundImage: `url(${SCENE}/near.png)`, backgroundSize: 'auto 100%' }}
          data-qr-layer="near"
        />
        {LANTERNS.map((x) => (
          <span
            key={x}
            className="qr-glow"
            style={{
              ...atCentre(x),
              bottom: `calc(${LANTERN_HEIGHT}px * var(--scene))`,
              translate: '-50% 50%',
            }}
          />
        ))}
        <span
          className="qr-sprite"
          data-qr-layer="wren"
          style={{ ...atCentre(WREN_X), backgroundImage: `url(${SCENE}/wren-idle.png)` }}
        />
        <span
          className="qr-sprite"
          data-state="idle"
          data-qr="hero-sprite"
          style={{ ...atCentre(HERO_X), backgroundImage: `url(${SCENE}/hero-idle.png)` }}
        />
        <Atmosphere raysFrom="86%" fireflies={12} seed={1} />
      </div>
    </header>
  );
}
