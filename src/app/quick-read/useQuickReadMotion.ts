import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

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
      const hero = q('[data-qr="hero-sprite"]')[0] as HTMLElement | undefined;
      const header = q('[data-qr="hero"]')[0] as HTMLElement | undefined;

      // Title card: moon rises, the town fills in back to front, the name
      // types in, the hero walks on. Never blocks scrolling or clicks.
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
          { scaleY: 0.1, opacity: 0, duration: 0.24, ease: 'steps(4)', stagger: 0.08 },
          0.9,
        );
      if (hero) {
        intro
          .set(
            hero,
            {
              attr: { 'data-state': 'walking' },
              backgroundImage: 'url(/assets/scene/hero-walk.png)',
            },
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

      // Depth: far layers drift less than near ones as the header scrolls away.
      if (header) {
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
      }

      // Each chapter opens like a menu window, once, as it arrives.
      for (const chapter of q('[data-qr="chapter"]')) {
        gsap.from(chapter, {
          x: -24,
          opacity: 0,
          duration: 0.24,
          ease: 'steps(3)',
          scrollTrigger: { trigger: chapter, start: 'top 90%', once: true },
        });
      }
      for (const frame of q('[data-qr="window"]')) {
        gsap.from(frame, {
          scaleY: 0.06,
          opacity: 0,
          duration: 0.32,
          ease: 'steps(4)',
          // Long chapters open from the top edge, which is the edge on screen.
          transformOrigin: '50% 0%',
          // Trigger on the untransformed section: a squashed frame measures wrong.
          scrollTrigger: { trigger: frame.parentElement ?? frame, start: 'top 85%', once: true },
        });
      }

      // Project screenshots wipe in left to right in hard pixel steps.
      for (const figure of q('#quests figure')) {
        gsap.from(figure, {
          clipPath: 'inset(0% 100% 0% 0%)',
          duration: 0.5,
          ease: 'steps(8)',
          scrollTrigger: { trigger: figure, start: 'top 85%', once: true },
        });
      }

      // The chronicle line draws itself down as you read the history.
      for (const line of q('[data-timeline-line]')) {
        gsap.from(line, {
          scaleY: 0,
          transformOrigin: 'top center',
          ease: 'steps(24)',
          scrollTrigger: { trigger: line, start: 'top 75%', end: 'bottom 60%', scrub: 0.4 },
        });
      }

      // Rarity badges are rewards, so they get the reward ease.
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
          scrollTrigger: {
            trigger: q('main')[0],
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        },
      );
    },
    { scope, dependencies: [reducedMotion], revertOnUpdate: true },
  );
}
