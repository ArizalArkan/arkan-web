import { useState } from 'react';
import Globe from 'react-globe.gl';
import { aboutContent } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import NbBadge from '../components/ui/NbBadge';
import NbButton from '../components/ui/NbButton';
import Logo from '../components/ui/Logo';
import PixelCat from '../components/ui/PixelCat';

const About = () => {
  const sectionRef = useScrollReveal();
  const [flipped, setFlipped] = useState(false);

  return (
    <section id="about" ref={sectionRef} className="c-space mx-auto w-full max-w-7xl py-20">
      <div data-reveal className="mb-10 flex flex-wrap items-center gap-4">
        <NbBadge variant="yellow">About me</NbBadge>
        <Logo variant="full" className="-rotate-2" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr] md:grid-rows-3">
        {/* ---------- flip stat tile ---------- */}
        <div
          data-reveal
          className="nb-flip-scene h-[230px]"
          onClick={() => setFlipped((f) => !f)}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label="Flip to see the industries I've shipped in"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}>
          <div className={`nb-flip-inner ${flipped ? 'is-flipped' : ''}`}>
            <div className="nb-flip-face nb-border flex flex-col gap-2 bg-nb-yellow p-6 shadow-nb">
              <span className="nb-badge w-fit bg-paper">About me</span>
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-5xl leading-none text-ink">{aboutContent.yearsLabel}</span>
                <span className="font-display text-base uppercase leading-tight text-ink">
                  {aboutContent.statHeadline[0]}
                  <br />
                  {aboutContent.statHeadline[1]}
                </span>
              </div>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-ink/80">{aboutContent.statBody}</p>
              <div className="flex-1" />
              <span className="font-mono text-[10px] uppercase text-ink/50">click for the industries &#8635;</span>
            </div>

            <div
              className="nb-flip-face nb-flip-face-back flex flex-col gap-2 border-3 border-ink bg-ink p-6"
              style={{ boxShadow: '4px 4px 0 0 #FFD93D' }}>
              <span className="w-fit border-2 border-nb-yellow px-3 py-1 font-mono text-xs uppercase tracking-wide text-nb-yellow">
                Shipped across
              </span>
              <div className="mt-1 flex flex-wrap gap-2">
                {aboutContent.industries.map((industry) => (
                  <span
                    key={industry}
                    className="border-2 border-nb-yellow px-3 py-1.5 font-display text-xs uppercase text-paper transition-transform duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5">
                    {industry}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-paper/75">{aboutContent.industriesBody}</p>
              <div className="flex-1" />
              <span className="font-mono text-[10px] uppercase text-paper/50">click to go back &#8635;</span>
            </div>
          </div>
        </div>

        {/* ---------- globe / location tile ---------- */}
        <div
          data-reveal
          className="nb-border flex flex-col items-center gap-4 bg-nb-sky p-6 shadow-nb md:row-span-3"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(10,10,10,0.14) 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
          }}>
          <div className="relative h-[200px] w-[200px]">
            <div className="nb-ring-out absolute inset-0 rounded-full border-[3px] border-dashed border-ink" aria-hidden="true" />
            <div className="nb-ring-in absolute inset-2 rounded-full border-2 border-dotted border-ink/50" aria-hidden="true" />
            <div className="absolute inset-5 flex items-center justify-center overflow-hidden rounded-full border-3 border-ink bg-ink">
              <Globe
                width={150}
                height={150}
                backgroundColor="rgba(0,0,0,0)"
                backgroundImageOpacity={0.5}
                showAtmosphere
                showGraticules
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                labelsData={[
                  {
                    lat: -6.256416487754249,
                    lng: 106.85206784837288,
                    text: aboutContent.location.city,
                    color: '#A8E10C',
                    size: 22,
                  },
                ]}
              />
            </div>
          </div>

          <span className="nb-badge bg-ink text-nb-lime">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="btn-ping" />
              <span className="btn-ping_dot" />
            </span>
            {aboutContent.location.city}
          </span>

          <div className="text-center">
            <p className="font-display text-base uppercase text-ink">{aboutContent.location.headline}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/75">{aboutContent.location.body}</p>
          </div>

          <NbButton
            variant="white"
            href={aboutContent.location.cta.href}
            label={`● ${aboutContent.location.cta.label}`}
            className="w-full !text-xs"
          />

          <PixelCat />
        </div>

        {/* ---------- passion tile ---------- */}
        <div data-reveal className="nb-border flex flex-col gap-2 bg-nb-pink p-6 shadow-nb">
          <span className="nb-badge w-fit bg-paper">{aboutContent.passion.eyebrow}</span>
          <h3 className="font-display text-lg uppercase text-ink">{aboutContent.passion.headline}</h3>
          <p className="text-sm leading-relaxed text-ink/80">{aboutContent.passion.body}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {aboutContent.passion.tags.map((tag) => (
              <span
                key={tag}
                className="nb-border bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-ink transition-transform duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ---------- resume tile ---------- */}
        <div data-reveal className="nb-border group flex items-center gap-4 overflow-hidden bg-nb-lime p-5 shadow-nb">
          <Logo
            variant="mark"
            className="h-16 w-16 text-2xl transition-transform duration-200 ease-out group-hover:-rotate-2 group-hover:scale-110"
          />
          <div className="flex-1">
            <p className="font-display text-sm uppercase text-ink">{aboutContent.resume.headline}</p>
            <p className="mt-0.5 text-xs text-ink/70">{aboutContent.resume.body}</p>
          </div>
          <NbButton variant="white" href={aboutContent.resume.cta.href} label={`${aboutContent.resume.cta.label} ▸`} className="!text-xs whitespace-nowrap" />
        </div>
      </div>
    </section>
  );
};

export default About;
