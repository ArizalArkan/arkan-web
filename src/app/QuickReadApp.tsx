import { useEffect, useRef, useState } from 'react';
import { copy } from '@/content/copy';
import { education, experience } from '@/content/experience';
import { profile } from '@/content/profile';
import { quests } from '@/content/quests';
import { skills } from '@/content/skills';
import { world } from '@/content/world';
import { SECTION_LOCATION } from '@/game/routing';
import { useSettingsStore } from '@/game/stores/useSettingsStore';
import { useReducedMotion } from '@/lib/motion';
import { formatRoute, parseRoute, type Route, type Section } from '@/lib/route';
import { analytics } from '@/services/analytics';
import { contactService } from '@/services/contact';
import { Icon } from '@/ui/primitives/Icon';
import { PixelFrame } from '@/ui/primitives/PixelFrame';
import { ChronicleTimeline } from '@/ui/sections/ChronicleTimeline';
import { ContactSection } from '@/ui/sections/ContactSection';
import { EquipmentGrid } from '@/ui/sections/EquipmentGrid';
import { QuestDetailSection } from '@/ui/sections/QuestDetailSection';
import { StatusSheet } from '@/ui/sections/StatusSheet';
import { ChapterSection } from './quick-read/ChapterSection';
import { QuickReadHero } from './quick-read/QuickReadHero';
import { QuickReadNav, type NavItem } from './quick-read/QuickReadNav';
import { useQuickReadMotion } from './quick-read/useQuickReadMotion';

type QuickReadAppProps = {
  /** False when the device cannot run the 3D town; hides the Adventure offer. */
  canAdventure: boolean;
  /** Shown once when the visitor was sent here because WebGL is missing. */
  notice?: string | null;
};

const NAV: NavItem[] = [
  { section: 'about', label: copy.about.heading, icon: 'hall' },
  { section: 'quests', label: copy.quests.heading, icon: 'scroll' },
  { section: 'skills', label: copy.skills.heading, icon: 'sword' },
  { section: 'experience', label: copy.experience.heading, icon: 'book' },
  { section: 'contact', label: copy.contact.heading, icon: 'letter' },
];

const placeOf = (section: Section) =>
  world.locations.find((location) => location.id === SECTION_LOCATION[section])?.name ?? '';

const chapterProps = (section: Section, index: number) => {
  const item = NAV[index]!;
  return {
    id: section,
    index,
    locationId: SECTION_LOCATION[section],
    place: placeOf(section),
    title: item.label,
    icon: item.icon,
    chapterLabel: copy.quickRead.chapter,
  };
};

const elementIdFor = (route: Route) =>
  route.kind === 'quest'
    ? `quest-${route.questId}`
    : route.kind === 'section'
      ? route.section
      : null;

const questHref = (questId: string) => formatRoute({ kind: 'quest', questId });

/**
 * Quick Read (PRODUCT.md C-06): every piece of portfolio content on one
 * page, dressed as a JRPG title sequence (DESIGN.md §8.5). No canvas, no
 * gamification, and nothing here waits on an animation to be readable.
 */
export default function QuickReadApp({ canAdventure, notice }: QuickReadAppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [missingQuest, setMissingQuest] = useState(false);
  const [active, setActive] = useState<Section | null>(null);

  useQuickReadMotion(rootRef, reducedMotion);

  // Deep links scroll to their section or quest; no scroll-jacking otherwise.
  useEffect(() => {
    const go = () => {
      const route = parseRoute(window.location.hash);
      const id = elementIdFor(route);
      const target = id ? document.getElementById(id) : null;
      setMissingQuest(route.kind === 'quest' && !target);
      const element = target ?? (route.kind === 'quest' ? document.getElementById('quests') : null);
      if (element) {
        element.scrollIntoView({ block: 'start' });
        element.focus({ preventScroll: true });
      }
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  // The nav cursor follows whichever chapter crosses the middle of the screen.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id as Section);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const item of NAV) {
      const element = document.getElementById(item.section);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  const toAdventure = () => {
    analytics.track('mode_selected', { mode: 'adventure' });
    useSettingsStore.getState().setMode('adventure');
  };

  return (
    <div ref={rootRef} className="min-h-dvh bg-night-900 text-parchment-100">
      <a
        href="#main"
        className="sr-only z-50 bg-gold-400 px-4 py-2 font-ui font-semibold text-ink-900 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {copy.a11y.skipToContent}
      </a>

      <QuickReadHero />

      <QuickReadNav
        items={NAV}
        active={active}
        canAdventure={canAdventure}
        onAdventure={toAdventure}
        showProgress={!reducedMotion}
      />

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto flex max-w-read flex-col gap-16 overflow-x-clip px-4 py-12 outline-none"
      >
        {notice ? (
          <PixelFrame role="status" className="flex items-start gap-3 font-body text-body-md">
            <Icon name="info" className="mt-1 shrink-0 text-mana-400" />
            {notice}
          </PixelFrame>
        ) : null}

        <ChapterSection {...chapterProps('about', 0)}>
          <StatusSheet profile={profile} headingLevel={3} showName={false} />
        </ChapterSection>

        <ChapterSection {...chapterProps('quests', 1)}>
          {missingQuest ? (
            <p role="status" className="flex items-center gap-2 font-ui text-ui-md text-mana-700">
              <Icon name="info" />
              {copy.quests.notFound}
            </p>
          ) : null}
          <div className="flex flex-col gap-12">
            {quests.map((quest, index) => (
              <div
                key={quest.id}
                id={`quest-${quest.id}`}
                tabIndex={-1}
                className="flex scroll-mt-24 flex-col gap-4 border-t-2 border-dashed border-ink-600/40 pt-8 outline-none first:border-0 first:pt-0"
                data-qr-block
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="pixel-text font-display text-display-sm text-ink-600 uppercase">
                    {copy.quickRead.questLabel} {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="stair -rotate-6 bg-ink-900 px-3 py-1.5 font-ui text-ui-sm font-semibold text-gold-400 shadow-pixel"
                    style={{ clipPath: 'var(--stair)' }}
                    data-qr="stamp"
                  >
                    {copy.quests.rank} {quest.rank}
                  </span>
                </div>
                <QuestDetailSection
                  quest={quest}
                  skills={skills}
                  headingLevel={3}
                  onLinkOpen={(linkIndex) =>
                    analytics.track('external_link_clicked', { quest: quest.id, index: linkIndex })
                  }
                />
              </div>
            ))}
          </div>
        </ChapterSection>

        <ChapterSection {...chapterProps('skills', 2)}>
          <EquipmentGrid
            skills={skills}
            quests={quests}
            headingLevel={3}
            layout="list"
            hrefForQuest={(quest) => questHref(quest.id)}
          />
        </ChapterSection>

        <ChapterSection {...chapterProps('experience', 3)}>
          <ChronicleTimeline
            experience={experience}
            education={education}
            certifications={profile.certifications}
            quests={quests}
            headingLevel={3}
            hrefForQuest={(quest) => questHref(quest.id)}
          />
        </ChapterSection>

        <ChapterSection {...chapterProps('contact', 4)}>
          <ContactSection
            profile={profile}
            headingLevel={3}
            send={(payload) => contactService.send(payload)}
            lastSentAt={() => contactService.lastSentAt}
            onSent={() => analytics.track('contact_submitted')}
            onCvDownload={() => analytics.track('cv_downloaded')}
          />
        </ChapterSection>
      </main>

      <footer className="mx-auto max-w-read px-4 pb-10 font-ui text-ui-sm text-dusk-300">
        <p>
          © {new Date().getFullYear()} {profile.name}. {copy.footer}
        </p>
      </footer>
    </div>
  );
}
