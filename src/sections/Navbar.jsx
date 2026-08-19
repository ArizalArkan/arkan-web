import { useEffect, useState } from 'react';
import { navLinks } from '../constants';
import Logo from '../components/ui/Logo';

const SCROLL_THRESHOLD = 12;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState('home');

  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  // Compact + shadow the header once the page has scrolled past it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight whichever section is currently in view, so the nav
  // reflects scroll position instead of only reacting to hover.
  useEffect(() => {
    const sections = navLinks
      .map(({ href }) => document.getElementById(href.replace('#', '')))
      .filter(Boolean);

    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const NavItems = ({ onNavigate }) => (
    <ul className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
      {navLinks.map(({ id, href, name }) => {
        const isActive = href.replace('#', '') === activeId;

        return (
          <li key={id} className="w-full sm:w-auto">
            <a
              href={href}
              onClick={onNavigate}
              className="group relative isolate flex items-center gap-1.5 px-3 py-2 font-mono text-sm uppercase tracking-wide text-ink">
              <span
                className={`absolute inset-0 -z-10 origin-left bg-nb-lime transition-transform duration-150 ease-out
                            ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                aria-hidden="true"
              />
              {isActive && <span className="h-1.5 w-1.5 shrink-0 bg-ink" aria-hidden="true" />}
              {name}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header
      className={`nb-navbar-in sticky top-0 z-50 border-b-3 border-ink bg-paper transition-[padding,box-shadow] duration-200 ease-out ${
        scrolled ? 'shadow-[0_4px_0_0_#0A0A0A]' : 'shadow-none'
      }`}>
      <div className="mx-auto max-w-7xl">
        <div
          className={`c-space mx-auto flex items-center justify-between transition-[padding] duration-200 ease-out ${
            scrolled ? 'py-2.5' : 'py-4'
          }`}>
          <div
            className={`origin-left transition-transform duration-200 ease-out ${
              scrolled ? 'scale-90' : 'scale-100'
            }`}>
            <Logo variant="compact" />
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            className="nb-btn bg-nb-yellow !px-3 !py-2 sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}>
            <img
              src={isOpen ? '/assets/close.svg' : '/assets/menu.svg'}
              alt=""
              className="h-5 w-5"
            />
          </button>

          <nav className="hidden sm:flex">
            <NavItems />
          </nav>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-150 ease-out sm:hidden ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}>
        <nav className="c-space border-t-3 border-ink bg-paper-2 py-4">
          <NavItems onNavigate={() => setIsOpen(false)} />
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
