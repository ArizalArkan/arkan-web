import { useEffect, useRef } from 'react';
import gsap from 'gsap';

import { aboutContent, heroContent, workProjects } from '../constants';

import NbBadge from '../components/ui/NbBadge';
import NbButton from '../components/ui/NbButton';

const STATS = [
  { value: aboutContent.yearsLabel, label: 'years exp', accent: 'bg-nb-yellow' },
  { value: `${workProjects.length}+`, label: 'products shipped', accent: 'bg-nb-pink' },
  { value: `${aboutContent.industries.length}`, label: 'industries', accent: 'bg-nb-lime' },
];

const Hero = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const { greetings } = heroContent;

  useEffect(() => {
    const ctx = gsap.context(() => {
      let i = 0;

      gsap.to(
        {},
        {
          duration: 2,
          repeat: -1,
          onRepeat: () => {
            gsap.to(textRef.current, {
              opacity: 0,
              duration: 0.5,
              onComplete: () => {
                if (!textRef.current) return;
                textRef.current.innerText = greetings[i];
                gsap.to(textRef.current, { opacity: 1, duration: 0.5 });
                i = (i + 1) % greetings.length;
              },
            });
          },
        },
      );
    });

    return () => ctx.revert();
  }, [greetings]);

  // One-shot entrance reveal. Skipped entirely under reduced-motion, so
  // elements just render at their normal opacity with no animation.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-hero-reveal]', {
        opacity: 0,
        y: 22,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="c-space mx-auto w-full max-w-7xl pb-16 pt-10 sm:pt-14">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        {/* ---------- left: copy ---------- */}
        <div className="flex flex-col items-start gap-5">
          <div className="flex flex-wrap items-center gap-3" data-hero-reveal>
            <NbBadge variant="yellow">
              <span ref={textRef} className="inline-block min-w-[5ch]">
                Hi
              </span>
              <span>{heroContent.name}</span>
            </NbBadge>

            <span className="nb-badge -rotate-3 bg-nb-pink">{heroContent.sticker}</span>
          </div>

          <h1
            data-hero-reveal
            className="isolate font-display uppercase leading-[0.95] tracking-tight text-ink text-[clamp(2.25rem,6.5vw,4.75rem)]">
            {heroContent.headline.map((line) => (
              <span key={line} className="block">
                {line === heroContent.highlight ? (
                  <span className="nb-mark">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p data-hero-reveal className="max-w-xl text-base text-ink/80 sm:text-lg">
            {heroContent.subhead}
          </p>

          <div data-hero-reveal className="flex flex-wrap gap-4">
            <NbButton
              variant="yellow"
              href={heroContent.ctaPrimary.href}
              label={`${heroContent.ctaPrimary.label} ▸`}
            />
            <NbButton
              variant="white"
              href={heroContent.ctaSecondary.href}
              label={heroContent.ctaSecondary.label}
            />
          </div>

          <div data-hero-reveal className="mt-2 flex flex-wrap gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className={`nb-border flex items-center gap-2 px-3 py-2 shadow-nb transition-transform duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 ${stat.accent}`}>
                <span className="font-display text-xl leading-none text-ink">{stat.value}</span>
                <span className="font-mono text-[10px] uppercase leading-tight text-ink/70">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- right: illustration ---------- */}
        <div data-hero-reveal className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <span
            className="nb-sparkle absolute -left-3 -top-3 z-0 h-4 w-4 rotate-45 bg-nb-lime"
            style={{ animationDelay: '0.2s' }}
            aria-hidden="true"
          />
          <span
            className="nb-sparkle absolute -right-2 top-8 z-0 h-3 w-3 rotate-45 bg-nb-sky"
            style={{ animationDelay: '0.9s' }}
            aria-hidden="true"
          />
          <span
            className="nb-sparkle absolute -bottom-3 left-10 z-0 h-3.5 w-3.5 rotate-45 bg-nb-pink"
            style={{ animationDelay: '1.5s' }}
            aria-hidden="true"
          />

          <div className="nb-illustration-float group relative z-10">
            <div className="nb-border aspect-[4/3] overflow-hidden bg-paper shadow-nb-xl-pink transition-transform duration-200 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1">
              <img
                src="/assets/arkanava.webp"
                alt="Pixel-art illustration of Arizal coding at his desk"
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            </div>

            <a
              href={heroContent.ctaPrimary.href}
              className="nb-badge absolute -bottom-4 left-1/2 z-20 -translate-x-1/2 translate-y-2 whitespace-nowrap bg-white opacity-0 shadow-nb transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              Let&apos;s build ▸
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToAbout}
        data-hero-reveal
        className="nb-scroll-cue mx-auto mt-16 flex flex-col items-center gap-1 border-0 bg-transparent text-ink/50 hover:text-ink"
        aria-label="Scroll to about section">
        <span className="font-mono text-[10px] uppercase tracking-widest">Scroll</span>
        <span className="text-lg leading-none">▾</span>
      </button>
    </section>
  );
};

export default Hero;
