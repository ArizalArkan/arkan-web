import { lazy, Suspense } from 'react';
import { profile } from '@/content/profile';
import { ReducedMotionProvider, usePrefersReducedMotion } from '@/lib/motion';

const ComponentCatalog = lazy(() => import('./ComponentCatalog'));

const isCatalog = () => new URLSearchParams(window.location.search).has('catalog');

// Temporary shell until Phase 7 adds mode selection.
export function App() {
  const reducedMotion = usePrefersReducedMotion();

  if (isCatalog()) {
    return (
      <ReducedMotionProvider value={reducedMotion}>
        <Suspense fallback={null}>
          <ComponentCatalog />
        </Suspense>
      </ReducedMotionProvider>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-read flex-col justify-center gap-6 p-6">
      <h1 className="pixel-text text-shadow-pixel font-display text-display-lg text-parchment-100 uppercase">
        {profile.name}
      </h1>
      <p className="font-ui text-ui-lg text-gold-400">{profile.role}</p>
      <p className="font-body text-body-md text-dusk-300">{profile.tagline}</p>
    </main>
  );
}
