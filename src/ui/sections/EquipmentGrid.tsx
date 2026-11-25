import { useState } from 'react';
import { copy } from '@/content/copy';
import { RARITIES, SKILL_SLOTS, type SkillSlot } from '@/content/ids';
import type { Quest, Skill } from '@/content/schema';
import { rarityMeaning, slotLabels } from '@/content/skills';
import { tabIds } from '../patterns/tabIds';
import { Tabs } from '../patterns/Tabs';
import { RarityBadge } from '../primitives/RarityBadge';
import { Heading } from './Heading';
import { nextLevel, type HeadingLevel } from './headingLevel';

type EquipmentGridProps = {
  skills: Skill[];
  quests: Quest[];
  headingLevel: HeadingLevel;
  hrefForQuest: (quest: Quest) => string;
  onQuestOpen?: (quest: Quest) => void;
  /** Tabs in the Adventure window; every slot listed at once in Quick Read. */
  layout?: 'tabs' | 'list';
};

/** Skills as equipment with honest rarity, never percentages (PRODUCT.md §7.4). */
export function EquipmentGrid({
  skills,
  quests,
  headingLevel,
  hrefForQuest,
  onQuestOpen,
  layout = 'tabs',
}: EquipmentGridProps) {
  const [slot, setSlot] = useState<SkillSlot>('frontend');
  const sub = nextLevel(headingLevel);

  const legend = (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 font-body text-body-sm sm:grid-cols-[auto_1fr]">
      {[...RARITIES].reverse().map((rarity) => (
        <div key={rarity} className="contents">
          <dt>
            <RarityBadge rarity={rarity} />
          </dt>
          <dd className="mb-2 sm:mb-0">{rarityMeaning[rarity]}</dd>
        </div>
      ))}
      <dt>
        <RarityBadge rarity={null} />
      </dt>
      <dd>{copy.skills.unrankedMeaning}</dd>
    </dl>
  );

  const slotList = (current: SkillSlot) => (
    <ul className="flex flex-col divide-y divide-current/15">
      {skills
        .filter((skill) => skill.slot === current)
        .map((skill) => (
          <li
            key={skill.id}
            className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-start sm:gap-4"
          >
            <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
              <span className="font-ui text-ui-md font-semibold">{skill.name}</span>
              <RarityBadge rarity={skill.rarity} />
            </div>
            {skill.provenBy.length > 0 ? (
              <p className="font-body text-body-sm">
                <span className="opacity-80">{copy.skills.provenBy}: </span>
                {skill.provenBy.map((questId, index) => {
                  const quest = quests.find((entry) => entry.id === questId);
                  if (!quest) return null;
                  return (
                    <span key={questId}>
                      {index > 0 ? ', ' : null}
                      <a
                        href={hrefForQuest(quest)}
                        onClick={(event) => {
                          if (!onQuestOpen) return;
                          event.preventDefault();
                          onQuestOpen(quest);
                        }}
                        className="underline decoration-2 underline-offset-2 hover:decoration-gold-600"
                      >
                        {quest.title}
                      </a>
                    </span>
                  );
                })}
              </p>
            ) : null}
          </li>
        ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-prose font-body text-body-md">{copy.skills.intro}</p>
      {legend}
      {layout === 'tabs' ? (
        <div className="flex flex-col gap-2">
          <Tabs
            idBase="armory"
            label={copy.skills.heading}
            value={slot}
            onChange={(value) => setSlot(value as SkillSlot)}
            items={SKILL_SLOTS.map((id) => ({
              id,
              label: `${slotLabels[id].name}`,
            }))}
          />
          <div
            id={tabIds('armory', slot).panel}
            role="tabpanel"
            aria-labelledby={tabIds('armory', slot).tab}
          >
            {slotList(slot)}
          </div>
        </div>
      ) : (
        SKILL_SLOTS.map((id) => (
          <section key={id} className="flex flex-col gap-1">
            <Heading level={sub} className="font-ui text-ui-lg font-semibold">
              {slotLabels[id].name}
              <span className="ml-2 font-ui text-ui-sm font-normal opacity-80">
                {slotLabels[id].equipment}
              </span>
            </Heading>
            {slotList(id)}
          </section>
        ))
      )}
    </div>
  );
}
