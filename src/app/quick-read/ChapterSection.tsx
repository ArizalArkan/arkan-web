import type { ReactNode } from 'react';
import type { LocationId } from '@/content/ids';
import type { Section } from '@/lib/route';
import { Icon } from '@/ui/primitives/Icon';
import type { IconName } from '@/ui/primitives/iconData';
import { PixelFrame } from '@/ui/primitives/PixelFrame';
import { Atmosphere } from './Atmosphere';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];
const SCENE = '/assets/scene';

type ChapterSectionProps = {
  id: Section;
  index: number;
  locationId: LocationId;
  /** Themed place name, e.g. "Guild Hall". */
  place: string;
  /** Literal heading, e.g. "About" (UX-GUIDELINES.md §1.4). */
  title: string;
  icon: IconName;
  chapterLabel: string;
  children: ReactNode;
};

/**
 * One portfolio section as a chapter (DESIGN.md §8.5): an establishing shot
 * of the place with a title card, then the content on a trimmed parchment
 * card. The shot is decoration; the heading and content carry the meaning.
 */
export function ChapterSection({
  id,
  index,
  locationId,
  place,
  title,
  icon,
  chapterLabel,
  children,
}: ChapterSectionProps) {
  const numeral = NUMERALS[index] ?? String(index + 1);
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-20 flex-col gap-0 outline-none"
      data-qr="chapter"
    >
      <div className="mb-4 flex flex-col items-center gap-2 px-4" aria-hidden="true">
        <div className="flex w-full max-w-sm items-center gap-3" data-qr="title-card">
          <span
            className="qr-title-line"
            style={{ ['--line-to' as string]: 'right' }}
            data-qr="title-line"
          />
          <span className="pixel-text font-display text-display-sm text-dusk-300 uppercase">
            {chapterLabel} {numeral}
          </span>
          <span
            className="qr-title-line"
            style={{ ['--line-to' as string]: 'left' }}
            data-qr="title-line"
          />
        </div>
        <span
          className="pixel-text text-shadow-pixel font-display text-display-md text-parchment-100 uppercase sm:text-display-lg"
          data-qr="title-place"
        >
          {place}
        </span>
      </div>

      <div className="qr-banner" aria-hidden="true" data-qr="banner">
        <div
          className="qr-layer qr-dof-mid"
          style={{ backgroundImage: `url(${SCENE}/banner-back.png)` }}
          data-qr="banner-back"
        />
        <div
          className="qr-layer"
          style={{ backgroundImage: `url(${SCENE}/banner-${locationId}.png)` }}
        />
        <Atmosphere raysFrom={index % 2 ? '20%' : '80%'} fireflies={6} seed={index + 3} />
      </div>

      <PixelFrame
        variant="parchment"
        padding="none"
        className="qr-card -mt-2 flex flex-col"
        data-qr="window"
      >
        <span className="qr-corner top-2 left-2" data-qr="corner" aria-hidden="true" />
        <span
          className="qr-corner top-2 right-2 -scale-x-100"
          data-qr="corner"
          aria-hidden="true"
        />
        <span
          className="qr-corner bottom-2 left-2 -scale-y-100"
          data-qr="corner"
          aria-hidden="true"
        />
        <span
          className="qr-corner right-2 bottom-2 -scale-100"
          data-qr="corner"
          aria-hidden="true"
        />
        <span className="qr-ribbon" data-qr="ribbon" aria-hidden="true" />
        <span className="qr-glare" data-qr="glare" aria-hidden="true" />

        <header className="relative flex items-center gap-4 overflow-hidden bg-night-800 px-6 py-4 text-parchment-100 sm:px-8">
          <span className="qr-band-shine" data-qr="band-shine" aria-hidden="true" />
          <span
            className="stair flex size-12 shrink-0 items-center justify-center bg-night-700 text-parchment-300"
            style={{ clipPath: 'var(--stair)' }}
            data-qr="emblem"
            aria-hidden="true"
          >
            <Icon name={icon} size={2} />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="font-ui text-ui-sm text-dusk-300">{place}</span>
            <h2 id={`${id}-title`} className="pixel-text font-display text-display-md uppercase">
              {title}
            </h2>
          </div>
        </header>

        <div className="qr-card-body flex flex-col gap-6 px-6 py-8 sm:px-10">{children}</div>
      </PixelFrame>
    </section>
  );
}
