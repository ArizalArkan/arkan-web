import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { copy, fill } from '@/content/copy';
import type { Quest, Skill } from '@/content/schema';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/motion';
import { formatRoute, parseRoute } from '@/lib/route';
import { analytics } from '@/services/analytics';
import { Icon } from '@/ui/primitives/Icon';
import { PixelButton } from '@/ui/primitives/PixelButton';
import { QuestDetailSection } from '@/ui/sections/QuestDetailSection';

type QuestCarouselProps = { quests: Quest[]; skills: Skill[] };

const SWIPE_PX = 60;
// Pinned notes hang a little crooked; fixed so the board looks the same every visit.
const TILT = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.5];

const indexFromHash = (quests: Quest[]) => {
  const route = parseRoute(window.location.hash);
  if (route.kind !== 'quest') return -1;
  return quests.findIndex((quest) => quest.id === route.questId);
};

/**
 * The Quest Board as a board: pinned notes to pick from, one quest page open
 * at a time. Every quest stays in the DOM (hidden), so Quick Read keeps full
 * content parity, print shows them all, and deep links still land.
 */
export function QuestCarousel({ quests, skills }: QuestCarouselProps) {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const swipeStart = useRef<number | null>(null);
  const direction = useRef(1);
  const [index, setIndex] = useState(() => Math.max(0, indexFromHash(quests)));
  const total = quests.length;
  const current = quests[index]!;

  // Deep links (#/quests/:id) pick the matching note.
  useEffect(() => {
    const sync = () => {
      const fromHash = indexFromHash(quests);
      if (fromHash >= 0) setIndex(fromHash);
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [quests]);

  // Keep the open quest's note in view inside the board (it scrolls sideways on phones).
  useEffect(() => {
    const note = tabRefs.current[index];
    const board = note?.parentElement;
    if (!note || !board) return;
    const left = note.offsetLeft - (board.clientWidth - note.offsetWidth) / 2;
    board.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [index, reducedMotion]);

  const go = (next: number, options: { focusTab?: boolean } = {}) => {
    const target = (next + total) % total;
    if (target === index) return;
    direction.current = target > index ? 1 : -1;
    setIndex(target);
    const quest = quests[target]!;
    // Shareable without a scroll jump: replaceState fires no hashchange.
    window.history.replaceState(null, '', formatRoute({ kind: 'quest', questId: quest.id }));
    analytics.track('quest_opened', { id: quest.id });
    if (options.focusTab) tabRefs.current[target]?.focus();
  };

  // A new page unrolls top-down, slides in from the side it came from, and
  // its rank stamp lands. Runs on every change except the first render.
  const isFirst = useRef(true);
  useGSAP(
    () => {
      if (isFirst.current) {
        isFirst.current = false;
        return;
      }
      if (reducedMotion) return;
      const q = gsap.utils.selector(rootRef);
      const page = q(`[data-slide="${index}"]`)[0];
      if (!page) return;
      const figure = page.querySelector('figure');
      figure?.classList.remove('is-shined');
      gsap
        .timeline()
        .from(page, {
          clipPath: 'inset(0% 0% 100% 0%)',
          x: 32 * direction.current,
          duration: 0.42,
          ease: 'steps(6)',
        })
        .from(
          q('[data-qr="carousel-stamp"]'),
          {
            scale: 2.2,
            rotate: -26,
            opacity: 0,
            duration: 0.32,
            ease: 'back.out(2.2)',
            transformOrigin: '100% 50%',
          },
          0.2,
        )
        .from(q(`[data-note="${index}"]`), { y: 10, duration: 0.3, ease: 'back.out(2)' }, 0)
        .call(() => figure?.classList.add('is-shined'), [], 0.45);
    },
    { scope: rootRef, dependencies: [index, reducedMotion] },
  );

  // Little wiggle when a note is pointed at, like paper on a pin.
  const { contextSafe } = useGSAP({ scope: rootRef });
  const wiggle = contextSafe((target: HTMLElement) => {
    if (reducedMotion) return;
    gsap.fromTo(
      target,
      { rotate: '+=0' },
      {
        keyframes: [{ rotate: '+=3' }, { rotate: '-=5' }, { rotate: '+=2' }],
        duration: 0.4,
        ease: 'power1.inOut',
      },
    );
  });

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: total - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    go(next, { focusTab: true });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') swipeStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (swipeStart.current === null) return;
    const dx = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div ref={rootRef} className="flex flex-col gap-6" data-carousel>
      <div>
        <p className="mb-3 font-ui text-ui-sm text-ink-600">{copy.quickRead.boardHint}</p>
        <div
          role="tablist"
          aria-label={copy.quickRead.boardLabel}
          onKeyDown={onTabKey}
          className="qr-board -mx-2 flex snap-x gap-3 overflow-x-auto px-2 pt-3 pb-4"
        >
          {quests.map((quest, i) => {
            const isActive = i === index;
            return (
              <button
                key={quest.id}
                ref={(node) => {
                  tabRefs.current[i] = node;
                }}
                type="button"
                role="tab"
                id={`quest-tab-${quest.id}`}
                aria-selected={isActive}
                aria-controls={`quest-${quest.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => go(i)}
                onMouseEnter={(event) => wiggle(event.currentTarget)}
                data-note={i}
                style={{ rotate: isActive ? '0deg' : `${TILT[i % TILT.length]}deg` }}
                className={cn(
                  'stair relative flex w-36 shrink-0 snap-start flex-col gap-1 p-3 pt-4 text-left transition-[translate] duration-(--motion-fast) ease-pixel',
                  isActive
                    ? '-translate-y-1.5 bg-parchment-100 text-ink-900 shadow-pixel outline-2 -outline-offset-2 outline-ink-900'
                    : 'bg-parchment-300/70 text-ink-600 hover:-translate-y-1',
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 left-1/2 size-2.5 -translate-x-1/2',
                    isActive ? 'bg-gold-400 outline-1 outline-ink-900' : 'bg-ink-600/60',
                  )}
                  aria-hidden="true"
                />
                <span className="pixel-text font-display text-display-sm">
                  {String(i + 1).padStart(2, '0')} · {copy.quests.rank} {quest.rank}
                </span>
                <span className="font-ui text-ui-md leading-tight font-semibold">
                  {quest.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <PixelButton
          variant="secondary"
          size="sm"
          onClick={() => go(index - 1)}
          aria-label={copy.quickRead.previousQuest}
          className="px-3"
        >
          <Icon name="back" />
        </PixelButton>
        <div className="flex items-center gap-4">
          <span
            className="pixel-text font-display text-display-sm text-ink-600 uppercase"
            aria-live="polite"
          >
            {fill(copy.quickRead.questCount, { current: index + 1, total })}
          </span>
          <span
            className="stair -rotate-6 bg-ink-900 px-3 py-1.5 font-ui text-ui-sm font-semibold text-gold-400 shadow-pixel"
            style={{ clipPath: 'var(--stair)' }}
            data-qr="carousel-stamp"
          >
            {copy.quests.rank} {current.rank}
          </span>
        </div>
        <PixelButton
          variant="secondary"
          size="sm"
          onClick={() => go(index + 1)}
          aria-label={copy.quickRead.nextQuest}
          className="px-3"
        >
          <Icon name="forward" />
        </PixelButton>
      </div>

      <div onPointerDown={onPointerDown} onPointerUp={onPointerUp} className="touch-pan-y">
        {quests.map((quest, i) => (
          <article
            key={quest.id}
            id={`quest-${quest.id}`}
            role="tabpanel"
            aria-labelledby={`quest-tab-${quest.id}`}
            hidden={i !== index}
            tabIndex={-1}
            className="scroll-mt-24 outline-none"
            data-slide={i}
          >
            <QuestDetailSection
              quest={quest}
              skills={skills}
              headingLevel={3}
              onLinkOpen={(linkIndex) =>
                analytics.track('external_link_clicked', { quest: quest.id, index: linkIndex })
              }
            />
          </article>
        ))}
      </div>
    </div>
  );
}
