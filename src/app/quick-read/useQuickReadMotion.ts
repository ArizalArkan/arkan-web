import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const once = (trigger: Element, start = 'top 85%') => ({ trigger, start, once: true });

/**
 * Quick Read choreography (DESIGN.md §8.5). Start states are only ever set
 * here, so without JS, in print, or under reduced motion the page is static
 * and complete. Pixel things move in steps; light and depth move smoothly.
 */
export function useQuickReadMotion(scope: RefObject<HTMLElement | null>, reducedMotion: boolean) {
  useGSAP(
    () => {
      if (reducedMotion) return;
      const q = gsap.utils.selector(scope);
      playTitleCard(q);
      addHeaderDepth(q);
      for (const chapter of q('[data-qr="chapter"]')) playChapter(chapter);
      revealBlocks(q);
      addSmallRewards(q);
    },
    { scope, dependencies: [reducedMotion], revertOnUpdate: true },
  );
}

type Query = (selector: string) => Element[];

/** Moon rises, the town fills in back to front, the name drops in, the hero walks on. */
const playTitleCard = (q: Query) => {
  const hero = q('[data-qr="hero-sprite"]')[0] as HTMLElement | undefined;
  const intro = gsap.timeline({ defaults: { ease: 'power2.out' } });
  intro
    .from(q('[data-qr="moon"]'), { y: 60, opacity: 0, duration: 0.7 }, 0)
    .from(q('[data-qr-layer]'), { y: 40, opacity: 0, duration: 0.45, stagger: 0.1 }, 0.1)
    .from(
      q('[data-qr="letter"]'),
      { y: -18, opacity: 0, duration: 0.2, ease: 'steps(3)', stagger: 0.035 },
      0.15,
    )
    .from(q('[data-qr="intro"]'), { opacity: 0, duration: 0.3, stagger: 0.08 }, 0.6)
    .from(
      q('[data-qr="cta-row"]'),
      { scaleY: 0.1, opacity: 0, duration: 0.24, ease: 'steps(4)' },
      0.9,
    )
    .from(
      q('[data-qr="status"]'),
      { scaleY: 0.05, opacity: 0, duration: 0.32, ease: 'steps(4)' },
      0.8,
    )
    .from(
      q('[data-qr="status-tag"]'),
      { scale: 0.4, opacity: 0, duration: 0.3, ease: 'back.out(1.7)', stagger: 0.05 },
      1.2,
    )
    .from(q('[data-qr="dialog"]'), { x: -60, opacity: 0, duration: 0.6, ease: 'power3.out' }, 1.2);

  // Stats count up from zero in whole steps.
  for (const node of q('[data-qr="count"]')) {
    const target = Number((node as HTMLElement).dataset.to ?? 0);
    const counter = { value: 0 };
    intro.to(
      counter,
      {
        value: target,
        duration: 0.8,
        ease: `steps(${Math.max(1, target)})`,
        onUpdate: () => {
          node.textContent = String(Math.round(counter.value));
        },
      },
      1.1,
    );
  }

  if (hero) {
    intro
      .set(
        hero,
        { attr: { 'data-state': 'walking' }, backgroundImage: 'url(/assets/scene/hero-walk.png)' },
        0.3,
      )
      .from(
        hero,
        { x: () => -(hero.offsetLeft + hero.offsetWidth), duration: 1.7, ease: 'none' },
        0.3,
      )
      .set(hero, {
        attr: { 'data-state': 'idle' },
        backgroundImage: 'url(/assets/scene/hero-idle.png)',
      });
  }
};

/** Far layers drift less than near ones as the header scrolls away. */
const addHeaderDepth = (q: Query) => {
  const header = q('[data-qr="hero"]')[0] as HTMLElement | undefined;
  if (!header) return;
  const depth: [string, number][] = [
    ['[data-qr="moon"]', 0.45],
    ['[data-qr-layer="far"]', 0.3],
    ['[data-qr-layer="mid"]', 0.18],
  ];
  for (const [selector, rate] of depth) {
    gsap.to(q(selector), {
      y: () => header.offsetHeight * rate,
      ease: 'none',
      snap: { y: 1 }, // whole pixels, so pixel art never shimmers
      scrollTrigger: { trigger: header, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
};

/** One chapter as a short cut-scene: establishing shot, title card, then the card opens. */
const playChapter = (chapter: Element) => {
  const find = (selector: string) => chapter.querySelectorAll(selector);
  const scene = gsap.timeline({ scrollTrigger: once(chapter, 'top 80%') });
  scene
    .from(find('[data-qr="title-line"]'), { scaleX: 0, duration: 0.4, ease: 'power2.out' }, 0)
    .from(
      find('[data-qr="title-place"]'),
      { y: 12, opacity: 0, duration: 0.24, ease: 'steps(3)' },
      0.15,
    )
    .from(
      find('[data-qr="banner"]'),
      { clipPath: 'inset(50% 0% 50% 0%)', duration: 0.55, ease: 'power3.out' },
      0.3,
    )
    .from(find('[data-qr="banner-back"]'), { x: -24, duration: 1.6, ease: 'power2.out' }, 0.3)
    .from(
      find('[data-qr="window"]'),
      // clip-path, not scale: blocks inside must keep their real positions
      // so their own scroll triggers measure correctly.
      { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.36, ease: 'steps(5)' },
      0.7,
    )
    .from(
      find('[data-qr="emblem"]'),
      { scale: 0.2, opacity: 0, duration: 0.4, ease: 'back.out(1.7)' },
      0.95,
    )
    .from(
      find('[data-qr="corner"]'),
      { scale: 0, duration: 0.2, ease: 'steps(2)', stagger: 0.05 },
      1,
    )
    .from(find('[data-qr="ribbon"]'), { yPercent: -100, duration: 0.3, ease: 'steps(4)' }, 1.05);
};

/** Content blocks wipe in left to right, each as it reaches the reader. */
const revealBlocks = (q: Query) => {
  const blocks = [...q('.qr-card-body > * > *'), ...q('[data-qr-block]')];
  for (const block of new Set(blocks)) {
    gsap.from(block, {
      clipPath: 'inset(0% 100% 0% 0%)',
      x: -8,
      duration: 0.45,
      ease: 'steps(6)',
      scrollTrigger: once(block, 'top 90%'),
    });
  }

  // Screenshots wipe in, then a light sweep passes over them.
  for (const figure of q('#quests figure')) {
    gsap.from(figure, {
      clipPath: 'inset(0% 100% 0% 0%)',
      duration: 0.5,
      ease: 'steps(8)',
      scrollTrigger: once(figure),
      onComplete: () => figure.classList.add('is-shined'),
    });
  }

  // A quest's rank lands like a rubber stamp.
  for (const stamp of q('[data-qr="stamp"]')) {
    gsap.from(stamp, {
      scale: 2.4,
      rotate: -28,
      // Grows from its right edge so the waiting state never pokes past the card.
      transformOrigin: '100% 50%',
      opacity: 0,
      duration: 0.35,
      ease: 'back.out(2.2)',
      scrollTrigger: once(stamp, 'top 88%'),
    });
  }
};

/** Smaller touches: the timeline draws, rarity badges pop, reading progress fills. */
const addSmallRewards = (q: Query) => {
  for (const line of q('[data-timeline-line]')) {
    gsap.from(line, {
      scaleY: 0,
      transformOrigin: 'top center',
      ease: 'steps(24)',
      scrollTrigger: { trigger: line, start: 'top 75%', end: 'bottom 60%', scrub: 0.4 },
    });
  }

  const badges = q('#skills .ptag');
  gsap.set(badges, { scale: 0.4, opacity: 0 });
  ScrollTrigger.batch(badges, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        ease: 'back.out(1.7)',
        stagger: 0.03,
      }),
  });

  gsap.fromTo(
    q('[data-qr="progress"]'),
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: q('main')[0], start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    },
  );
};
