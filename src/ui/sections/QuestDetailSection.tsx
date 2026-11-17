import { useState } from 'react';
import { copy } from '@/content/copy';
import type { Media, Quest, Skill } from '@/content/schema';
import { PixelButton } from '../primitives/PixelButton';
import { Tag } from '../primitives/Tag';
import { Heading } from './Heading';
import { nextLevel, type HeadingLevel } from './headingLevel';

type QuestDetailSectionProps = {
  quest: Quest;
  skills: Skill[];
  headingLevel: HeadingLevel;
  /** Hide the title when the window header already shows it. */
  showTitle?: boolean;
  onLinkOpen?: (index: number) => void;
};

/** Problem, role, what I did, result, then stack, media and links. */
export function QuestDetailSection({
  quest,
  skills,
  headingLevel,
  showTitle = true,
  onLinkOpen,
}: QuestDetailSectionProps) {
  const sub = showTitle ? nextLevel(headingLevel) : headingLevel;
  const stack = quest.stack.map((id) => skills.find((skill) => skill.id === id)?.name ?? id);
  const blockTitle = 'font-ui text-ui-md font-semibold uppercase tracking-normal';

  return (
    <article className="flex flex-col gap-5" aria-label={showTitle ? undefined : quest.title}>
      {showTitle ? (
        <header className="flex flex-col gap-1">
          <Heading level={headingLevel} className="font-ui text-ui-lg font-semibold">
            {quest.title}
          </Heading>
          <p className="font-ui text-ui-sm opacity-80">
            {quest.tagline} · {quest.period}
          </p>
        </header>
      ) : (
        <p className="font-ui text-ui-sm opacity-80">
          {quest.tagline} · {quest.period}
        </p>
      )}

      {quest.media.map((media) => (
        <QuestImage key={media.src} media={media} />
      ))}

      <section className="flex flex-col gap-1.5">
        <Heading level={sub} className={blockTitle}>
          {copy.quests.problem}
        </Heading>
        <p className="max-w-prose font-body text-body-md">{quest.problem}</p>
      </section>

      <section className="flex flex-col gap-1.5">
        <Heading level={sub} className={blockTitle}>
          {copy.quests.role}
        </Heading>
        <p className="max-w-prose font-body text-body-md">{quest.role}</p>
      </section>

      <section className="flex flex-col gap-1.5">
        <Heading level={sub} className={blockTitle}>
          {copy.quests.solution}
        </Heading>
        <ul className="flex max-w-prose list-[square] flex-col gap-1.5 pl-6 font-body text-body-md">
          {quest.solution.map((item) => (
            <li key={item.slice(0, 32)}>{item}</li>
          ))}
        </ul>
      </section>

      {/* No outcome on record: the block is left out rather than padded. */}
      {quest.outcome ? (
        <section className="flex flex-col gap-1.5">
          <Heading level={sub} className={blockTitle}>
            {copy.quests.outcome}
          </Heading>
          <p className="max-w-prose font-body text-body-md">{quest.outcome}</p>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <Heading level={sub} className={blockTitle}>
          {copy.quests.stack}
        </Heading>
        <ul className="flex flex-wrap gap-2">
          {[...stack, ...quest.tags].map((name) => (
            <li key={name}>
              <Tag>{name}</Tag>
            </li>
          ))}
        </ul>
      </section>

      {quest.links.length > 0 ? (
        <section className="flex flex-col gap-2">
          <Heading level={sub} className={blockTitle}>
            {copy.quests.links}
          </Heading>
          <div className="flex flex-wrap gap-3">
            {quest.links.map((link, index) => (
              <PixelButton
                key={link.href}
                href={link.href}
                variant={index === 0 ? 'primary' : 'secondary'}
                onClick={() => onLinkOpen?.(index)}
              >
                {link.label}
              </PixelButton>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

/** Fixed-size box so nothing shifts while it loads; a pixel placeholder if it fails. */
function QuestImage({ media }: { media: Media }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure
      className="relative w-full overflow-hidden bg-night-900"
      style={{ aspectRatio: `${media.width} / ${media.height}` }}
    >
      {failed ? (
        <figcaption className="absolute inset-0 flex items-center justify-center p-4 text-center font-ui text-ui-sm text-dusk-300">
          {copy.errors.imageFailed}: {media.alt}
        </figcaption>
      ) : (
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      )}
    </figure>
  );
}
