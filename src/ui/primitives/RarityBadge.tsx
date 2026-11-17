import type { ComponentProps } from 'react';
import { copy } from '@/content/copy';
import type { Rarity } from '@/content/ids';
import { Tag } from './Tag';
import type { IconName } from './iconData';

type RarityBadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** null = the owner has not rated this skill yet. */
  rarity: Rarity | null;
};

// Color never stands alone: each rarity also has its own icon and its name.
const looks: Record<Rarity, { tone: 'gold' | 'mana' | 'herb' | 'neutral'; icon: IconName }> = {
  legendary: { tone: 'gold', icon: 'star' },
  epic: { tone: 'mana', icon: 'gem' },
  rare: { tone: 'herb', icon: 'coin' },
  common: { tone: 'neutral', icon: 'check' },
};

export function RarityBadge({ rarity, ...rest }: RarityBadgeProps) {
  if (!rarity) {
    return (
      <Tag tone="neutral" icon="lock" {...rest}>
        {copy.skills.unranked}
      </Tag>
    );
  }
  const look = looks[rarity];
  return (
    <Tag tone={look.tone} icon={look.icon} {...rest}>
      {copy.skills.rarityNames[rarity]}
    </Tag>
  );
}
