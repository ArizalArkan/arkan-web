import { contactContent } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import Logo from '../components/ui/Logo';

const SOCIAL_IDS = ['github', 'linkedin', 'email'];

const socials = SOCIAL_IDS.map((id) => contactContent.commands.find((c) => c.id === id)).filter(
  Boolean,
);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const Footer = () => {
  const sectionRef = useScrollReveal();

  return (
    <footer ref={sectionRef} className="border-t-3 border-ink bg-paper">
      <div className="c-space mx-auto flex max-w-7xl flex-col gap-8 py-10">
        <div data-reveal className="flex flex-wrap items-center justify-between gap-6">
          <Logo variant="compact" />

          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.href}
                {...(social.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="nb-border bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-ink shadow-nb transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:rotate-2 hover:bg-nb-lime">
                {social.id}
              </a>
            ))}
          </div>
        </div>

        <div
          data-reveal
          className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-ink/30 pt-6">
          <p className="font-mono text-xs text-ink/50">
            © {new Date().getFullYear()} Arizal Arkan — built with React, Tailwind &amp; GSAP
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="nb-btn bg-white !px-3 !py-2 text-xs"
            aria-label="Back to top">
            <span className="nb-top-cue inline-block">&#9650;</span>
            <span className="ml-1.5">back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
