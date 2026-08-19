import { useEffect } from 'react';
import { cvContent } from '../constants/cv';
import { navigate } from '../hooks/useHashRoute';
import { useScrollReveal } from '../hooks/useScrollReveal';
import NbButton from '../components/ui/NbButton';
import NbBadge from '../components/ui/NbBadge';

const CVPage = () => {
  const pageRef = useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <header className="sticky top-0 z-50 border-b-3 border-ink bg-paper">
        <div className="c-space mx-auto flex max-w-5xl items-center justify-between py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="nb-btn bg-white">
            &#9664; Back to portfolio
          </button>
          <NbButton variant="yellow" href={cvContent.contact.githubHref} external label="GITHUB ▸" />
        </div>
      </header>

      <div ref={pageRef} className="c-space mx-auto max-w-5xl py-14">
        {/* ---------- header ---------- */}
        <div data-reveal className="flex flex-col gap-5">
          <NbBadge variant="lime">Resume</NbBadge>
          <h1 className="font-display uppercase leading-[0.95] tracking-tight text-ink text-[clamp(2rem,6vw,4rem)]">
            {cvContent.name}
          </h1>
          <p className="font-mono text-sm uppercase tracking-wide text-ink/60">
            {cvContent.role} — {cvContent.location}
          </p>

          <div className="flex flex-wrap gap-3">
            <a href={cvContent.contact.emailHref} className="nb-badge bg-white hover:bg-nb-yellow">
              {cvContent.contact.email}
            </a>
            <a href={cvContent.contact.phoneHref} className="nb-badge bg-white hover:bg-nb-yellow">
              {cvContent.contact.phone}
            </a>
            <a
              href={cvContent.contact.linkedinHref}
              target="_blank"
              rel="noopener noreferrer"
              className="nb-badge bg-white hover:bg-nb-yellow">
              {cvContent.contact.linkedin}
            </a>
            <a
              href={cvContent.contact.githubHref}
              target="_blank"
              rel="noopener noreferrer"
              className="nb-badge bg-white hover:bg-nb-yellow">
              {cvContent.contact.github}
            </a>
          </div>
        </div>

        {/* ---------- summary ---------- */}
        <div data-reveal className="nb-card mt-10 p-6 sm:p-8">
          <p className="text-base leading-relaxed text-ink/80 sm:text-lg">{cvContent.summary}</p>
        </div>

        {/* ---------- skills ---------- */}
        <div data-reveal className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cvContent.skills.map((group) => (
            <div key={group.category} className="nb-card p-5">
              <h3
                className="mb-3 inline-block font-display uppercase text-sm"
                style={{ backgroundColor: group.accent, padding: '2px 8px', border: '2px solid #0A0A0A' }}>
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="nb-border bg-paper-2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-ink">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ---------- experience ---------- */}
        <div data-reveal className="mt-14">
          <h2 className="mb-6 font-display uppercase text-ink text-[clamp(1.5rem,4vw,2.25rem)]">
            Work experience
          </h2>

          <div className="flex flex-col gap-6">
            {cvContent.experience.map((job) => (
              <div key={job.company + job.product} className="nb-card p-6 sm:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-ink/50">{job.company}</p>
                    <h3 className="font-display uppercase leading-tight text-ink text-lg sm:text-xl">
                      {job.product}
                    </h3>
                  </div>
                  <span className="nb-border bg-nb-sky px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-ink">
                    {job.period}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  {job.roles.map((role) => (
                    <div key={role.title + role.period}>
                      <p className="font-display text-sm uppercase text-ink">
                        {role.title} <span className="font-mono font-normal normal-case text-ink/50">· {role.period}</span>
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {role.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-ink/75">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-ink" aria-hidden="true" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- freelance / project experience ---------- */}
        <div data-reveal className="mt-14">
          <h2 className="mb-6 font-display uppercase text-ink text-[clamp(1.5rem,4vw,2.25rem)]">
            Project experience
          </h2>

          {cvContent.projects.map((project) => (
            <div key={project.name} className="nb-card bg-nb-yellow p-6 shadow-nb-lg sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-ink/60">
                    {project.role} · {project.period}
                  </p>
                  <h3 className="font-display uppercase leading-tight text-ink text-lg sm:text-xl">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink/70">{project.product}</p>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-1.5">
                {project.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-ink/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-ink" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ---------- education + certifications ---------- */}
        <div data-reveal className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="nb-card p-6">
            <h2 className="mb-4 font-display uppercase text-ink text-lg">Education</h2>
            <div className="flex flex-col gap-3">
              {cvContent.education.map((edu) => (
                <div key={edu.school}>
                  <p className="font-display text-sm uppercase text-ink">{edu.school}</p>
                  <p className="font-mono text-xs text-ink/60">{edu.program} · {edu.period}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="nb-card p-6">
            <h2 className="mb-4 font-display uppercase text-ink text-lg">Certifications</h2>
            <ul className="flex flex-col gap-2">
              {cvContent.certifications.map((cert) => (
                <li key={cert} className="flex gap-2 text-sm text-ink/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-ink" aria-hidden="true" />
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-reveal className="mt-14 flex justify-center">
          <NbButton
            variant="white"
            label="◀ Back to portfolio"
            onClick={() => navigate('/')}
          />
        </div>
      </div>
    </main>
  );
};

export default CVPage;
