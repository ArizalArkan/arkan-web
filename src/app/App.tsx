import { profile } from '@/content/profile';

// Temporary shell: proves the toolchain and content layer render.
// Replaced by mode selection in Phase 7.
export function App() {
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
