import { useEffect, useRef } from 'react';
import { copy } from '@/content/copy';
import { education, experience } from '@/content/experience';
import { profile } from '@/content/profile';
import { quests } from '@/content/quests';
import { skills } from '@/content/skills';
import { world } from '@/content/world';
import { openQuest } from '@/game/actions';
import { useGameStore } from '@/game/stores/useGameStore';
import { useUIStore } from '@/game/stores/useUIStore';
import { formatRoute } from '@/lib/route';
import { analytics } from '@/services/analytics';
import { contactService } from '@/services/contact';
import { Window } from '../patterns/Window';
import type { LocationWindowId } from './locationWindows';
import type { IconName } from '../primitives/iconData';
import { ChronicleTimeline } from '../sections/ChronicleTimeline';
import { ContactSection } from '../sections/ContactSection';
import { EquipmentGrid } from '../sections/EquipmentGrid';
import { QuestDetailSection } from '../sections/QuestDetailSection';
import { QuestList } from '../sections/QuestList';
import { StatusSheet } from '../sections/StatusSheet';

const ICONS: Record<LocationWindowId, IconName> = {
  'guild-hall': 'hall',
  'quest-board': 'scroll',
  armory: 'sword',
  library: 'book',
  'post-office': 'letter',
};

const questHref = (questId: string) => formatRoute({ kind: 'quest', questId });

/** Content window for one location. Sections are the same ones Quick Read uses. */
export function LocationWindow({ id }: { id: LocationWindowId }) {
  const questId = useUIStore((state) => state.questId);
  const closeWindow = useUIStore((state) => state.closeWindow);
  const closeQuest = useUIStore((state) => state.closeQuest);
  const readIds = useGameStore((state) => state.questsRead);
  const bodyRef = useRef<HTMLDivElement>(null);
  const listScroll = useRef(0);

  const location = world.locations.find((entry) => entry.window === id);
  const quest =
    id === 'quest-board' && questId ? quests.find((entry) => entry.id === questId) : undefined;

  // Detail starts at the top; going back restores where the list was (UX §9.4).
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = quest ? 0 : listScroll.current;
  }, [quest]);

  const goToQuest = (targetId: string) => {
    if (bodyRef.current && !quest) listScroll.current = bodyRef.current.scrollTop;
    openQuest(targetId);
  };

  const onLinkOpen = (index: number) => {
    if (!quest) return;
    useGameStore.getState().openLink(quest.id, index);
    analytics.track('external_link_clicked', { quest: quest.id, index });
  };

  return (
    <Window
      id={id}
      title={quest ? quest.title : (location?.name ?? '')}
      subtitle={quest ? copy.quests.heading : location?.literal}
      icon={ICONS[id]}
      variant={id === 'quest-board' && !quest ? 'window' : 'parchment'}
      width={id === 'quest-board' && !quest ? 'grid' : 'read'}
      onClose={closeWindow}
      onBack={quest ? closeQuest : undefined}
      bodyRef={bodyRef}
    >
      {id === 'guild-hall' ? <StatusSheet profile={profile} headingLevel={3} /> : null}

      {id === 'quest-board' && !quest ? (
        <QuestList
          quests={quests}
          readIds={readIds}
          headingLevel={3}
          hrefFor={(entry) => questHref(entry.id)}
          onOpen={(entry) => goToQuest(entry.id)}
        />
      ) : null}

      {quest ? (
        <QuestDetailSection
          quest={quest}
          skills={skills}
          headingLevel={3}
          showTitle={false}
          onLinkOpen={onLinkOpen}
        />
      ) : null}

      {id === 'armory' ? (
        <EquipmentGrid
          skills={skills}
          quests={quests}
          headingLevel={3}
          hrefForQuest={(entry) => questHref(entry.id)}
          onQuestOpen={(entry) => goToQuest(entry.id)}
        />
      ) : null}

      {id === 'library' ? (
        <ChronicleTimeline
          experience={experience}
          education={education}
          certifications={profile.certifications}
          quests={quests}
          headingLevel={3}
          hrefForQuest={(entry) => questHref(entry.id)}
          onQuestOpen={(entry) => goToQuest(entry.id)}
        />
      ) : null}

      {id === 'post-office' ? (
        <ContactSection
          profile={profile}
          headingLevel={3}
          send={(payload) => contactService.send(payload)}
          lastSentAt={() => contactService.lastSentAt}
          onSent={() => {
            useGameStore.getState().markContactSent();
            analytics.track('contact_submitted');
          }}
          onCvDownload={() => analytics.track('cv_downloaded')}
        />
      ) : null}
    </Window>
  );
}
