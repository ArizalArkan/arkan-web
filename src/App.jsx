import { lazy, Suspense, useEffect } from 'react';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import Work from './sections/Work';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import Experience from './sections/Experience';
import Marquee from './components/ui/Marquee';
import { heroContent } from './constants';
import { useHashRoute } from './hooks/useHashRoute';

// Code-split: CVPage is a separate route, never needed on first load.
// About pulls in react-globe.gl (three.js under the hood) — the
// heaviest thing left in the bundle — so it's worth its own chunk too.
const About = lazy(() => import('./sections/About'));
const CVPage = lazy(() => import('./pages/CVPage'));

const ANCHOR_IDS = ['home', 'about', 'experience', 'work', 'contact'];

const AboutFallback = () => (
  <section id="about" className="c-space mx-auto w-full max-w-7xl py-20">
    <div className="mb-10 h-9 w-32 nb-border bg-paper-2" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr] md:grid-rows-3">
      <div className="nb-border h-[230px] bg-paper-2 shadow-nb" />
      <div className="nb-border bg-paper-2 shadow-nb md:row-span-3" />
      <div className="nb-border h-40 bg-paper-2 shadow-nb" />
      <div className="nb-border h-24 bg-paper-2 shadow-nb" />
    </div>
  </section>
);

const CVPageFallback = () => (
  <main className="flex min-h-screen items-center justify-center bg-paper">
    <p className="font-mono text-sm uppercase tracking-wide text-ink/50">Loading résumé…</p>
  </main>
);

const App = () => {
  const path = useHashRoute();
  const isCVPage = path === '/cv';

  // Native same-page anchor scrolling only fires against the DOM present
  // at the moment the hash changes. Coming back from /cv, that DOM is
  // still CVPage's — the target section doesn't exist yet — so this
  // covers that case once the homepage has actually mounted.
  useEffect(() => {
    if (isCVPage) return;
    if (!ANCHOR_IDS.includes(path)) return;
    document.getElementById(path)?.scrollIntoView();
  }, [path, isCVPage]);

  if (isCVPage) {
    return (
      <Suspense fallback={<CVPageFallback />}>
        <CVPage />
      </Suspense>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      <Marquee items={heroContent.marquee} durationSeconds={32} />
      <Hero />

      <Suspense fallback={<AboutFallback />}>
        <About />
      </Suspense>

      <Experience />
      <Work />
      <Contact />
      <Footer />
    </main>
  );
};

export default App;
