import { useEffect, useRef, useState } from 'react';
import { workProjects } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import NbButton from '../components/ui/NbButton';
import NbBadge from '../components/ui/NbBadge';

const STACK_COLORS = ['#A8E10C', '#7DD3FC'];
const AUTO_ADVANCE_MS = 6000;

// Purely decorative — a dot-grid backdrop plus scattered floating tech
// chips to fill the wide empty gutters around the card on desktop.
// Hidden below lg: there's no side space to put them in on mobile/tablet,
// and cramming them in would just look cluttered.
const CHIPS = [
  { content: '</>', accent: '#FFD93D', className: 'left-[6%] top-[14%]', delay: '0s' },
  { content: '{ }', accent: '#FF6B9D', className: 'right-[8%] top-[10%]', delay: '0.6s' },
  { content: '$_', accent: '#7DD3FC', className: 'left-[9%] top-[62%]', delay: '1.2s' },
  { content: '01', accent: '#A8E10C', className: 'right-[5%] top-[56%]', delay: '0.3s' },
  { content: '#', accent: '#FFD93D', className: 'right-[12%] top-[80%]', delay: '1.8s' },
  { content: '</>', accent: '#7DD3FC', className: 'left-[4%] top-[85%]', delay: '0.9s' },
];

const WorkBackdrop = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(10,10,10,0.09) 1.5px, transparent 1.5px)',
        backgroundSize: '26px 26px',
      }}
    />
    <div className="hidden lg:block">
      {CHIPS.map((chip, i) => (
        <span
          key={i}
          className={`nb-illustration-float absolute ${chip.className}`}
          style={{ animationDelay: chip.delay }}>
          <span
            className="nb-border flex h-10 w-10 rotate-[-4deg] items-center justify-center font-mono text-sm shadow-nb"
            style={{ backgroundColor: chip.accent }}>
            {chip.content}
          </span>
        </span>
      ))}
    </div>
  </div>
);

const WorkThumb = ({ project }) => {
  const [broken, setBroken] = useState(false);

  return (
    <div className="nb-work-thumb nb-border relative mb-4 h-40 w-full overflow-hidden sm:h-48">
      {!broken && (
        <img
          src={project.image}
          alt={`${project.title} preview`}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full scale-100 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      )}
      {broken && (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink/40">
            preview coming soon
          </span>
        </div>
      )}
    </div>
  );
};

const Work = () => {
  const sectionRef = useScrollReveal();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const total = workProjects.length;
  const current = workProjects[index];
  const counterLabel = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  const goTo = (nextIndex, dir) => {
    setDirection(dir);
    setIndex(((nextIndex % total) + total) % total);
  };

  const prev = () => goTo(index - 1, 'prev');
  const next = () => goTo(index + 1, 'next');

  // Auto-advance, paused on hover/focus and skipped under reduced-motion
  // (an auto-changing card is itself a motion effect, not just a CSS
  // flourish, so it gets the same opt-out).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (paused) return undefined;

    timerRef.current = window.setInterval(() => {
      setDirection('next');
      setIndex((i) => (i + 1) % total);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timerRef.current);
  }, [paused, total]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') prev();
    if (event.key === 'ArrowRight') next();
  };

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative mx-auto w-full max-w-7xl overflow-hidden c-space py-20">
      <WorkBackdrop />

      <div data-reveal className="flex flex-col items-start gap-3">
        <NbBadge variant="pink">Selected work</NbBadge>
        <h2 className="font-display uppercase leading-[0.95] tracking-tight text-ink text-[clamp(1.75rem,5vw,3rem)]">
          Products I&apos;ve helped build
        </h2>
      </div>

      <div
        data-reveal
        className="relative mt-12 flex justify-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={handleKeyDown}>
        <div
          className="absolute h-[340px] w-[calc(100%-32px)] max-w-xl nb-border sm:h-[320px]"
          style={{ background: STACK_COLORS[0], transform: 'translate(14px, 14px) rotate(2deg)' }}
          aria-hidden="true"
        />
        <div
          className="absolute h-[340px] w-[calc(100%-32px)] max-w-xl nb-border sm:h-[320px]"
          style={{ background: STACK_COLORS[1], transform: 'translate(7px, 7px) rotate(-1.5deg)' }}
          aria-hidden="true"
        />

        <div
          key={current.id}
          className={`nb-card group relative flex w-full max-w-xl flex-col p-6 shadow-nb-lg sm:p-7 ${
            direction === 'next' ? 'nb-card-enter-next' : 'nb-card-enter-prev'
          }`}>
          <WorkThumb project={current} />

          <div className="flex items-center justify-between">
            <span className="nb-badge" style={{ backgroundColor: current.accent }}>
              {current.subtitle}
            </span>
            <span className="font-mono text-xs text-ink/50">{counterLabel}</span>
          </div>

          <div className="mt-4">
            <h3 className="font-display uppercase leading-tight text-ink text-2xl">{current.title}</h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink/50">{current.period}</p>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/75 sm:text-base">{current.desc}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {current.tags.map((tag) => (
              <span
                key={tag}
                className="nb-border bg-paper-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink transition-transform duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous project"
                className="nb-btn !px-3 !py-2 bg-white">
                &#9664;
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next project"
                className="nb-btn !px-3 !py-2 bg-white">
                &#9654;
              </button>

              <div className="flex items-center gap-1.5" role="tablist" aria-label="Select project">
                {workProjects.map((project, i) => (
                  <button
                    key={project.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Show ${project.title}`}
                    onClick={() => goTo(i, i > index ? 'next' : 'prev')}
                    className={`h-2 w-2 border-2 border-ink transition-all duration-150 ease-out ${
                      i === index ? 'scale-125 bg-ink' : 'bg-transparent hover:bg-ink/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <NbButton variant="yellow" href={current.href} external label={`${current.ctaLabel} ▸`} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
