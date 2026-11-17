import { copy } from '@/content/copy';
import type { Quest } from '@/content/schema';
import { cn } from '@/lib/cn';
import { Icon } from '../primitives/Icon';
import { Tag } from '../primitives/Tag';
import { Heading } from './Heading';
import type { HeadingLevel } from './headingLevel';

type QuestCardProps = {
  quest: Quest;
  isRead: boolean;
  headingLevel: HeadingLevel;
  href: string;
  onOpen?: () => void;
};

const rankTone = { S: 'gold', A: 'mana', B: 'herb', C: 'neutral' } as const;

/**
 * One quest on the board. The whole card is a single link (COMPONENTS.md §4),
 * never a card with a button inside it.
 */
export function QuestCard({ quest, isRead, headingLevel, href, onOpen }: QuestCardProps) {
  const media = quest.media[0];
  return (
    <a
      href={href}
      onClick={(event) => {
        if (!onOpen) return;
        event.preventDefault();
        onOpen();
      }}
      className={cn(
        'group flex h-full flex-col gap-3 bg-night-800 p-3 outline-1 -outline-offset-1 outline-dusk-500',
        'transition-transform duration-(--motion-fast) ease-pixel hover:-translate-y-1 hover:outline-gold-400',
      )}
      data-testid={`quest-card-${quest.id}`}
    >
      {media ? (
        <img
          src={media.src}
          alt=""
          width={media.width}
          height={media.height}
          className="aspect-[16/9] w-full bg-night-900 object-cover object-top"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <Tag tone={rankTone[quest.rank]}>
          {copy.quests.rank} {quest.rank}
        </Tag>
        <span
          className={cn(
            'flex items-center gap-1 font-ui text-ui-sm',
            isRead ? 'text-herb-400' : 'text-gold-400',
          )}
        >
          {isRead ? <Icon name="check" /> : <Icon name="star" />}
          {isRead ? copy.quests.statusRead : copy.quests.statusNew}
        </span>
      </div>
      <Heading level={headingLevel} className="font-ui text-ui-lg font-semibold text-parchment-100">
        {quest.title}
      </Heading>
      <p className="font-ui text-ui-sm text-dusk-300">
        {quest.tagline} · {quest.period}
      </p>
      <p className="font-body text-body-sm text-parchment-100">{quest.summary}</p>
    </a>
  );
}
