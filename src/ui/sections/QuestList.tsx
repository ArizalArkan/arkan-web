import { useState } from 'react';
import { copy } from '@/content/copy';
import type { Quest } from '@/content/schema';
import { EmptyState } from '../patterns/EmptyState';
import { tabIds } from '../patterns/tabIds';
import { Tabs } from '../patterns/Tabs';
import type { HeadingLevel } from './headingLevel';
import { QuestCard } from './QuestCard';

type Filter = 'all' | 'featured';

type QuestListProps = {
  quests: Quest[];
  readIds: string[];
  headingLevel: HeadingLevel;
  hrefFor: (quest: Quest) => string;
  onOpen?: (quest: Quest) => void;
};

/** Quest grid with a small filter (COMPONENTS.md §4). One column on phones. */
export function QuestList({ quests, readIds, headingLevel, hrefFor, onOpen }: QuestListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const visible = filter === 'featured' ? quests.filter((quest) => quest.featured) : quests;
  const ids = tabIds('quest-filter', filter);

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        idBase="quest-filter"
        label={copy.quests.heading}
        value={filter}
        onChange={(value) => setFilter(value as Filter)}
        items={[
          { id: 'all', label: copy.quests.filterAll },
          { id: 'featured', label: copy.quests.filterFeatured },
        ]}
      />
      <div id={ids.panel} role="tabpanel" aria-labelledby={ids.tab}>
        {visible.length === 0 ? (
          <EmptyState
            illustration="scroll"
            title={copy.quests.filterEmptyTitle}
            description={copy.quests.filterEmptyBody}
            action={{ label: copy.actions.resetFilter, onClick: () => setFilter('all') }}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visible.map((quest) => (
              <li key={quest.id}>
                <QuestCard
                  quest={quest}
                  isRead={readIds.includes(quest.id)}
                  headingLevel={headingLevel}
                  href={hrefFor(quest)}
                  onOpen={onOpen ? () => onOpen(quest) : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
