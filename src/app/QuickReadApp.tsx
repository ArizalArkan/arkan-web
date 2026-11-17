import { useEffect, useState, type ReactNode } from 'react';
import { copy } from '@/content/copy';
import { education, experience } from '@/content/experience';
import { profile } from '@/content/profile';
import { quests } from '@/content/quests';
import { skills } from '@/content/skills';
import { world } from '@/content/world';
import { useSettingsStore } from '@/game/stores/useSettingsStore';
import { formatRoute, parseRoute, type Route, type Section } from '@/lib/route';
import { analytics } from '@/services/analytics';
import { contactService } from '@/services/contact';
import { Icon } from '@/ui/primitives/Icon';
import type { IconName } from '@/ui/primitives/iconData';
import { PixelButton } from '@/ui/primitives/PixelButton';
import { PixelFrame } from '@/ui/primitives/PixelFrame';
import { ChronicleTimeline } from '@/ui/sections/ChronicleTimeline';
import { ContactSection } from '@/ui/sections/ContactSection';
import { EquipmentGrid } from '@/ui/sections/EquipmentGrid';
import { QuestDetailSection } from '@/ui/sections/QuestDetailSection';
import { StatusSheet } from '@/ui/sections/StatusSheet';

type QuickReadAppProps = {
  /** False when the device cannot run the 3D town; hides the Adventure offer. */
  canAdventure: boolean;
  /** Shown once when the visitor was sent here because WebGL is missing. */
  notice?: string | null;
};

const NAV: { section: Section; label: string; icon: IconName }[] = [
  { section: 'about', label: copy.about.heading, icon: 'hall' },
  { section: 'quests', label: copy.quests.heading, icon: 'scroll' },
  { section: 'skills', label: copy.skills.heading, icon: 'sword' },
  { section: 'experience', label: copy.experience.heading, icon: 'book' },
  { section: 'contact', label: copy.contact.heading, icon: 'letter' },
];

const elementIdFor = (route: Route) =>
  route.kind === 'quest'
    ? `quest-${route.questId}`
    : route.kind === 'section'
      ? route.section
      : null;

/**
 * Quick Read (PRODUCT.md C-06): the whole portfolio as one plain document,
 * with every piece of content Adventure Mode has, no canvas and no gamification.
 */
export default function QuickReadApp({ canAdventure, notice }: QuickReadAppProps) {
  const [missingQuest, setMissingQuest] = useState(false);

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

  const toAdventure = () => {
    analytics.track('mode_selected', { mode: 'adventure' });
    useSettingsStore.getState().setMode('adventure');
  };

  return (
    <div className="min-h-dvh bg-night-900 text-parchment-100">
      <a
        href="#main"
        className="sr-only z-50 bg-gold-400 px-4 py-2 font-ui font-semibold text-ink-900 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {copy.a11y.skipToContent}
      </a>

      <header className="mx-auto flex max-w-read flex-col gap-4 px-4 pt-10 pb-6">
        <p className="font-ui text-ui-md text-dusk-300">{world.name}</p>
        <h1 className="pixel-text text-shadow-pixel font-display text-display-lg uppercase">
          {profile.name}
        </h1>
        <p className="font-ui text-ui-lg text-gold-400">
          {profile.role} · {profile.location}
        </p>
        <p className="font-body text-body-lg">{profile.tagline}</p>
        <div className="flex flex-wrap gap-3">
          <PixelButton
            href={formatRoute({ kind: 'section', section: 'contact' })}
            iconLeft="letter"
          >
            {copy.actions.sendLetter}
          </PixelButton>
          {profile.cv ? (
            <PixelButton
              variant="secondary"
              href={profile.cv.href}
              download={profile.cv.fileName}
              iconLeft="download"
              onClick={() => analytics.track('cv_downloaded')}
            >
              {copy.actions.downloadCv}
            </PixelButton>
          ) : (
            <PixelButton variant="secondary" iconLeft="print" onClick={() => window.print()}>
              {copy.actions.printCv}
            </PixelButton>
          )}
        </div>
      </header>

      <nav
        aria-label={copy.modes.quickRead}
        className="sticky top-0 z-20 border-y-2 border-dusk-500 bg-night-900/95 print:hidden"
      >
        <div className="mx-auto flex max-w-grid items-center gap-1 overflow-x-auto px-2 py-1">
          {NAV.map((item) => (
            <a
              key={item.section}
              href={formatRoute({ kind: 'section', section: item.section })}
              className="flex min-h-11 shrink-0 items-center gap-2 px-3 font-ui text-ui-md font-semibold hover:text-gold-400"
            >
              <Icon name={item.icon} />
              {item.label}
            </a>
          ))}
          {canAdventure ? (
            <PixelButton
              variant="ghost"
              size="sm"
              iconLeft="map"
              className="ml-auto shrink-0"
              onClick={toAdventure}
              data-testid="to-adventure"
            >
              {copy.modes.adventure}
            </PixelButton>
          ) : null}
        </div>
      </nav>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto flex max-w-read flex-col gap-12 px-4 py-10 outline-none"
      >
        {notice ? (
          <PixelFrame role="status" className="flex items-start gap-3 font-body text-body-md">
            <Icon name="info" className="mt-1 shrink-0 text-mana-400" />
            {notice}
          </PixelFrame>
        ) : null}

        {canAdventure && !notice ? (
          <p className="flex flex-wrap items-center gap-2 font-ui text-ui-sm text-dusk-300 print:hidden">
            {copy.modes.adventureBanner}
            <button
              type="button"
              onClick={toAdventure}
              className="min-h-11 font-semibold text-gold-400 underline"
            >
              {copy.modes.tryAdventure}
            </button>
          </p>
        ) : null}

        <Block id="about" title={copy.about.heading}>
          <StatusSheet profile={profile} headingLevel={3} showName={false} />
        </Block>

        <Block id="quests" title={copy.quests.heading}>
          {missingQuest ? (
            <p
              role="status"
              className="mb-4 flex items-center gap-2 font-ui text-ui-md text-mana-700"
            >
              <Icon name="info" />
              {copy.quests.notFound}
            </p>
          ) : null}
          <div className="flex flex-col gap-10">
            {quests.map((quest) => (
              <div
                key={quest.id}
                id={`quest-${quest.id}`}
                tabIndex={-1}
                className="scroll-mt-20 outline-none"
              >
                <QuestDetailSection
                  quest={quest}
                  skills={skills}
                  headingLevel={3}
                  onLinkOpen={(index) =>
                    analytics.track('external_link_clicked', { quest: quest.id, index })
                  }
                />
              </div>
            ))}
          </div>
        </Block>

        <Block id="skills" title={copy.skills.heading}>
          <EquipmentGrid
            skills={skills}
            quests={quests}
            headingLevel={3}
            layout="list"
            hrefForQuest={(quest) => formatRoute({ kind: 'quest', questId: quest.id })}
          />
        </Block>

        <Block id="experience" title={copy.experience.heading}>
          <ChronicleTimeline
            experience={experience}
            education={education}
            certifications={profile.certifications}
            quests={quests}
            headingLevel={3}
            hrefForQuest={(quest) => formatRoute({ kind: 'quest', questId: quest.id })}
          />
        </Block>

        <Block id="contact" title={copy.contact.heading}>
          <ContactSection
            profile={profile}
            headingLevel={3}
            send={(payload) => contactService.send(payload)}
            lastSentAt={() => contactService.lastSentAt}
            onSent={() => analytics.track('contact_submitted')}
            onCvDownload={() => analytics.track('cv_downloaded')}
          />
        </Block>
      </main>

      <footer className="mx-auto max-w-read px-4 pb-10 font-ui text-ui-sm text-dusk-300">
        <p>
          © {new Date().getFullYear()} {profile.name}. {copy.footer}
        </p>
      </footer>
    </div>
  );
}

function Block({ id, title, children }: { id: Section; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-16 outline-none"
    >
      <PixelFrame variant="parchment" padding="lg" className="flex flex-col gap-6">
        <h2 id={`${id}-title`} className="pixel-text font-display text-display-md uppercase">
          {title}
        </h2>
        {children}
      </PixelFrame>
    </section>
  );
}
