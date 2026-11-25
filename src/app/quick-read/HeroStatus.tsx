import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
import { Tag } from '@/ui/primitives/Tag';

/** Leading number of a stat like "6+", so it can count up; the rest is kept as a suffix. */
const splitStat = (value: string) => {
  const match = /^(\d+)(.*)$/.exec(value);
  return match ? { count: Number(match[1]), suffix: match[2] ?? '' } : null;
};

/**
 * Party-menu style summary beside the title: the facts a recruiter scans
 * for first (PRODUCT.md C-01), all real profile data.
 */
export function HeroStatus() {
  return (
    <section
      aria-label={copy.quickRead.statusTitle}
      className="qr-status stair flex flex-col gap-4 p-5 text-parchment-100"
      style={{ clipPath: 'var(--stair)' }}
      data-qr="status"
    >
      <p className="pixel-text font-display text-display-sm text-dusk-300 uppercase">
        {copy.quickRead.statusTitle}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-ui text-ui-md">
        <dt className="text-dusk-300">{copy.about.classLabel}</dt>
        <dd className="font-semibold">{profile.heroClass}</dd>
        <dt className="text-dusk-300">{copy.about.locationLabel}</dt>
        <dd>{profile.location}</dd>
        <dt className="text-dusk-300">{copy.about.availabilityLabel}</dt>
        <dd className="text-herb-400">{profile.availability.split('.')[0]}</dd>
      </dl>
      <ul className="grid grid-cols-3 gap-2 border-y border-dusk-500 py-3">
        {profile.stats.map((stat) => {
          const parts = splitStat(stat.value);
          return (
            <li key={stat.label} className="flex flex-col gap-1">
              <span className="pixel-text font-display text-display-md">
                {parts ? (
                  <>
                    <span data-qr="count" data-to={parts.count}>
                      {parts.count}
                    </span>
                    {parts.suffix}
                  </>
                ) : (
                  stat.value
                )}
              </span>
              <span className="font-ui text-ui-sm text-dusk-300">{stat.label}</span>
            </li>
          );
        })}
      </ul>
      <ul className="flex flex-wrap gap-1.5" aria-label={copy.about.industriesLabel}>
        {profile.industries.map((industry) => (
          <li key={industry} data-qr="status-tag">
            <Tag>{industry}</Tag>
          </li>
        ))}
      </ul>
    </section>
  );
}
