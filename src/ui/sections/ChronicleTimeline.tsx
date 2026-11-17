import { copy } from '@/content/copy';
import type { Education, Experience, Quest } from '@/content/schema';
import { Tag } from '../primitives/Tag';
import { Heading } from './Heading';
import type { HeadingLevel } from './headingLevel';

type ChronicleTimelineProps = {
  experience: Experience[];
  education: Education[];
  certifications: string[];
  quests: Quest[];
  headingLevel: HeadingLevel;
  hrefForQuest: (quest: Quest) => string;
  onQuestOpen?: (quest: Quest) => void;
};

/** Work history, newest first, then education and certifications. */
export function ChronicleTimeline({
  experience,
  education,
  certifications,
  quests,
  headingLevel,
  hrefForQuest,
  onQuestOpen,
}: ChronicleTimelineProps) {
  return (
    <div className="flex flex-col gap-8">
      <ol className="flex flex-col gap-6 border-l-2 border-current/30 pl-5">
        {experience.map((entry) => {
          const quest = entry.questId ? quests.find((item) => item.id === entry.questId) : null;
          return (
            <li key={entry.id} className="relative flex flex-col gap-2">
              <span
                className="absolute top-2 -left-[calc(var(--px)*6.5)] size-3 bg-current"
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui text-ui-sm opacity-80">{entry.period}</span>
                {entry.isCurrent ? <Tag tone="herb">{copy.experience.current}</Tag> : null}
              </div>
              <Heading level={headingLevel} className="font-ui text-ui-lg font-semibold">
                {entry.product}
                <span className="block font-ui text-ui-sm font-normal opacity-80">
                  {entry.company} · {entry.productTagline}
                </span>
              </Heading>
              {entry.roles.map((role) => (
                <div key={role.title + role.period} className="flex flex-col gap-1">
                  <p className="font-ui text-ui-md font-semibold">
                    {role.title}
                    <span className="ml-2 font-normal opacity-80">{role.period}</span>
                  </p>
                  <ul className="flex max-w-prose list-[square] flex-col gap-1 pl-6 font-body text-body-sm">
                    {role.achievements.map((item) => (
                      <li key={item.slice(0, 32)}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {quest ? (
                <a
                  href={hrefForQuest(quest)}
                  onClick={(event) => {
                    if (!onQuestOpen) return;
                    event.preventDefault();
                    onQuestOpen(quest);
                  }}
                  className="w-fit font-ui text-ui-sm font-semibold underline decoration-2 underline-offset-2"
                >
                  {copy.experience.seeQuest}: {quest.title}
                </a>
              ) : null}
            </li>
          );
        })}
      </ol>

      <section className="flex flex-col gap-2">
        <Heading level={headingLevel} className="font-ui text-ui-lg font-semibold">
          {copy.experience.education}
        </Heading>
        <ul className="flex flex-col gap-2">
          {education.map((entry) => (
            <li key={entry.school} className="font-body text-body-md">
              <span className="font-semibold">{entry.school}</span>
              <span className="block font-ui text-ui-sm opacity-80">
                {entry.program} · {entry.period}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <Heading level={headingLevel} className="font-ui text-ui-lg font-semibold">
          {copy.experience.certifications}
        </Heading>
        <ul className="flex list-[square] flex-col gap-1 pl-6 font-body text-body-md">
          {certifications.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
