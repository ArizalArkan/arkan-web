import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Reveals every `[data-reveal]` descendant with a staggered fade+slide the
// first time the returned ref's element enters the viewport. Skipped
// entirely under prefers-reduced-motion — elements just render at full
// opacity, no animation.
export function useScrollReveal() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const targets = root.querySelectorAll('[data-reveal]');
    if (targets.length === 0) return undefined;

    gsap.set(targets, { opacity: 0, y: 24 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
        });
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return rootRef;
}
