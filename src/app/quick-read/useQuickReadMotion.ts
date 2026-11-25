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
      return addCardHover(q);
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

/**
 * Far layers drift less than near ones while the scene is on screen. The
 * distance is a share of the scene's own height, so layers never slide out
 * and leave empty sky.
 */
const addHeaderDepth = (q: Query) => {
  const scene = q('[data-qr="scene"]')[0] as HTMLElement | undefined;
  if (!scene) return;
  for (const wrapper of q('[data-qr-depth]')) {
    const rate = Number((wrapper as HTMLElement).dataset.qrDepth ?? 0);
    gsap.fromTo(
      wrapper,
      { y: 0 },
      {
        y: () => scene.offsetHeight * rate * 0.4,
        ease: 'none',
        snap: { y: 1 }, // whole pixels, so pixel art never shimmers
        scrollTrigger: { trigger: scene, start: 'top 60%', end: 'bottom top', scrub: true },
      },
    );
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
  // Quests hidden in the carousel animate when the carousel shows them.
  for (const figure of q('#quests figure').filter((el) => !el.closest('[hidden]'))) {
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

/**
 * Hover on a chapter card (fine pointers only): a warm light follows the
 * cursor under the text, the card lifts, its trims react, and the
 * establishing shot drifts with the mouse. Pure decoration; nothing is
 * hover-only information.
 */
const addCardHover = (q: Query) => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
  const cleanups: (() => void)[] = [];

  for (const chapter of q('[data-qr="chapter"]')) {
    const card = chapter.querySelector<HTMLElement>('[data-qr="window"]');
    const back = chapter.querySelector<HTMLElement>('[data-qr="banner-back"]');
    const banner = chapter.querySelector<HTMLElement>('[data-qr="banner"]');
    if (!card) continue;
    const find = (selector: string) => card.querySelectorAll(selector);
    const glare = card.querySelector<HTMLElement>('[data-qr="glare"]');
    const shadow = card.querySelector<HTMLElement>('.pf-shadow');
    const moveGlareX = glare
      ? gsap.quickTo(glare, '--gx', { duration: 0.5, ease: 'power3' })
      : null;
    const moveGlareY = glare
      ? gsap.quickTo(glare, '--gy', { duration: 0.5, ease: 'power3' })
      : null;
    const moveBack = back ? gsap.quickTo(back, 'x', { duration: 0.8, ease: 'power3' }) : null;

    const hover = gsap
      .timeline({ paused: true, defaults: { duration: 0.3, ease: 'power2.out' } })
      .to(card, { y: -4 }, 0)
      .to(shadow, { y: '+=4' }, 0)
      .to(glare, { opacity: 1 }, 0)
      .to(find('[data-qr="corner"]'), { scale: 1.35, ease: 'steps(2)', duration: 0.16 }, 0)
      .to(find('[data-qr="emblem"]'), { scale: 1.12, y: -2, ease: 'back.out(2)' }, 0)
      .fromTo(
        find('[data-qr="band-shine"]'),
        { xPercent: -120 },
        { xPercent: 120, duration: 0.8, ease: 'power1.inOut' },
        0,
      );

    const swingRibbon = () =>
      gsap.fromTo(
        find('[data-qr="ribbon"]'),
        { rotate: 0 },
        {
          keyframes: [{ rotate: 7 }, { rotate: -5 }, { rotate: 3 }, { rotate: 0 }],
          duration: 0.9,
          ease: 'sine.inOut',
          transformOrigin: '50% 0%',
        },
      );

    const onEnter = () => {
      hover.play();
      swingRibbon();
    };
    const onLeave = () => hover.reverse();
    const onMove = (event: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      moveGlareX?.(((event.clientX - rect.left) / rect.width) * 100);
      moveGlareY?.(((event.clientY - rect.top) / rect.height) * 100);
    };
    const onBannerMove = (event: MouseEvent) => {
      if (!banner) return;
      const rect = banner.getBoundingClientRect();
      moveBack?.(((event.clientX - rect.left) / rect.width - 0.5) * -16);
    };
    const onBannerLeave = () => moveBack?.(0);

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('mousemove', onMove);
    banner?.addEventListener('mousemove', onBannerMove);
    banner?.addEventListener('mouseleave', onBannerLeave);
    cleanups.push(() => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
      card.removeEventListener('mousemove', onMove);
      banner?.removeEventListener('mousemove', onBannerMove);
      banner?.removeEventListener('mouseleave', onBannerLeave);
    });
  }
  return () => cleanups.forEach((cleanup) => cleanup());
};
