import { copy } from '@/content/copy';
import type { Profile } from '@/content/schema';
import { Tag } from '../primitives/Tag';
import { Heading } from './Heading';
import { nextLevel, type HeadingLevel } from './headingLevel';

type StatusSheetProps = {
  profile: Profile;
  headingLevel: HeadingLevel;
  /** Hide the name heading when the surrounding window already shows it. */
  showName?: boolean;
};

/**
 * Character sheet (COMPONENTS.md §4): role, location and availability sit
 * above the fold (PRODUCT.md C-01), the bio follows.
 */
export function StatusSheet({ profile, headingLevel, showName = true }: StatusSheetProps) {
  const sub = nextLevel(headingLevel);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <img
          src={profile.portrait.src}
          alt={profile.portrait.alt}
          width={profile.portrait.width}
          height={profile.portrait.height}
          className="pixelated aspect-[3/2] w-full max-w-60 shrink-0 bg-parchment-300 object-cover outline-2 outline-ink-900 sm:w-48"
          loading="lazy"
          decoding="async"
        />
        <div className="flex min-w-0 flex-col gap-3">
          {showName ? (
            <Heading
              level={headingLevel}
              className="pixel-text font-display text-display-md uppercase"
            >
              {profile.name}
            </Heading>
          ) : null}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-ui text-ui-md">
            <dt className="text-ink-600">{copy.about.classLabel}</dt>
            <dd className="font-semibold">{profile.heroClass}</dd>
            <dt className="text-ink-600">{copy.about.locationLabel}</dt>
            <dd>{profile.location}</dd>
            <dt className="text-ink-600">{copy.about.availabilityLabel}</dt>
            <dd>{profile.availability}</dd>
          </dl>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {profile.stats.map((stat) => (
          <li key={stat.label} className="flex flex-col bg-parchment-300/50 p-3">
            <span className="pixel-text font-display text-display-md">{stat.value}</span>
            <span className="font-ui text-ui-sm text-ink-600">{stat.label}</span>
          </li>
        ))}
      </ul>

      <div className="flex max-w-prose flex-col gap-3 font-body text-body-md">
        {profile.bio.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Heading level={sub} className="font-ui text-ui-md font-semibold">
          {copy.about.industriesLabel}
        </Heading>
        <ul className="flex flex-wrap gap-2">
          {profile.industries.map((industry) => (
            <li key={industry}>
              <Tag>{industry}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
