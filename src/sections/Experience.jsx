import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cvContent } from '../constants/cv';
import { useScrollReveal } from '../hooks/useScrollReveal';
import NbBadge from '../components/ui/NbBadge';

gsap.registerPlugin(ScrollTrigger);

const ACCENTS = ['#FFD93D', '#FF6B9D', '#7DD3FC', '#A8E10C'];

const STOPS = cvContent.experience.map((job, index) => ({
  id: `${job.company}-${job.product}`,
  company: job.company,
  product: job.product,
  period: job.period,
  current: job.period.includes('Now'),
  accent: ACCENTS[index % ACCENTS.length],
  roles: job.roles,
}));

const Experience = () => {
  const sectionRef = useScrollReveal();
  const railRef = useRef(null);
  const fillRef = useRef(null);
  const [openId, setOpenId] = useState(STOPS[0]?.id ?? null);

  const toggle = (id) => setOpenId((current) => (current === id ? null : id));

  // Scroll-linked fill that grows down the rail as the timeline scrolls
  // through view — a genuine scroll-tied animation, not a scroll-trigger
  // reveal. Skipped under reduced-motion; the rail is still fully
  // legible without it (it's a progress indicator, not content).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (!railRef.current || !fillRef.current) return undefined;

    const st = ScrollTrigger.create({
      trigger: railRef.current,
      start: 'top 75%',
      end: 'bottom 65%',
      scrub: 0.4,
      onUpdate: (self) => {
        if (fillRef.current) fillRef.current.style.height = `${self.progress * 100}%`;
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="c-space mx-auto w-full max-w-7xl py-20">
      <div data-reveal className="mb-10 flex flex-col items-start gap-3">
        <NbBadge variant="yellow">Career</NbBadge>
        <h2 className="font-display uppercase leading-[0.95] tracking-tight text-ink text-[clamp(1.75rem,5vw,3rem)]">
          Work history
        </h2>
      </div>

      <div className="relative pl-7 sm:pl-8" ref={railRef}>
        {/* dashed base rail + scroll-linked accent fill on top of it */}
        <div
          className="absolute bottom-1.5 left-[5px] top-1.5 w-[3px]"
          style={{
            backgroundImage: 'repeating-linear-gradient(#0A0A0A, #0A0A0A 6px, transparent 6px, transparent 12px)',
          }}
          aria-hidden="true"
        />
        <div
          ref={fillRef}
          className="absolute left-[5px] top-1.5 w-[3px] bg-nb-lime"
          style={{ height: '0%' }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-4">
          {STOPS.map((stop) => {
            const isOpen = openId === stop.id;

            return (
              <div key={stop.id} data-reveal className="relative">
                <span
                  className="absolute -left-7 top-4 h-3.5 w-3.5 border-3 border-ink sm:-left-8"
                  style={{ backgroundColor: stop.accent }}
                  aria-hidden="true"
                />
                {stop.current && (
                  <span
                    className="nb-node-ping absolute -left-7 top-4 h-3.5 w-3.5 bg-ink sm:-left-8"
                    aria-hidden="true"
                  />
                )}

                <button
                  type="button"
                  onClick={() => toggle(stop.id)}
                  aria-expanded={isOpen}
                  className="nb-border group w-full bg-white p-4 text-left shadow-nb transition-transform duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wide text-ink/50">
                          {stop.company}
                        </span>
                        {stop.current && (
                          <span className="nb-border inline-flex items-center gap-1.5 bg-nb-lime px-2 py-1 font-mono text-[9px] uppercase text-ink">
                            <span className="nb-live-dot h-1.5 w-1.5 shrink-0 rounded-full border border-ink/40 bg-green-500" />
                            current
                          </span>
                        )}
                      </div>
                      <h3 className="mt-0.5 font-display text-base uppercase leading-tight text-ink sm:text-lg">
                        {stop.product}
                      </h3>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className="nb-border whitespace-nowrap px-2 py-1 font-mono text-[10px] uppercase"
                        style={{ backgroundColor: stop.accent }}>
                        {stop.period}
                      </span>
                      <span
                        className={`text-xs text-ink/60 transition-transform duration-200 ease-out ${isOpen ? '-rotate-180' : ''}`}
                        aria-hidden="true">
                        ▾
                      </span>
                    </div>
                  </div>

                  <div className={`nb-accordion ${isOpen ? 'is-open' : ''}`}>
                    <div>
                      <div className="mt-4 flex flex-col gap-4 border-t-2 border-dashed border-ink/30 pt-4">
                        {stop.roles.map((role) => (
                          <div key={role.title + role.period}>
                            <p className="font-display text-xs uppercase text-ink">
                              {role.title}{' '}
                              <span className="font-mono font-normal normal-case text-ink/50">
                                · {role.period}
                              </span>
                            </p>
                            <ul className="mt-1.5 flex flex-col gap-1">
                              {role.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-2 text-xs leading-relaxed text-ink/70">
                                  <span className="mt-1.5 h-1 w-1 shrink-0 bg-ink" aria-hidden="true" />
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
