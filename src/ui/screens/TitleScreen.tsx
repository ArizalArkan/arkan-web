import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
import { world } from '@/content/world';
import { PixelButton } from '../primitives/PixelButton';
import { LoadingScreen, type LoadPhase } from './LoadingScreen';

type TitleScreenProps = {
  phase: LoadPhase | 'ready';
  progress: number;
  onStart: () => void;
  onQuickRead: () => void;
  onRetry: () => void;
};

/**
 * First screen. Name, role and the Quick Read exit are on screen from the
 * first paint (PRODUCT.md P1), while the town loads underneath.
 */
export function TitleScreen({ phase, progress, onStart, onQuickRead, onRetry }: TitleScreenProps) {
  return (
    <main
      id="main"
      className="relative flex min-h-dvh flex-col items-center justify-center gap-10 overflow-hidden bg-night-900 px-4 py-12 text-center"
      data-testid="title-screen"
    >
      <header className="flex flex-col items-center gap-4">
        <p className="font-ui text-ui-md text-dusk-300">{world.name}</p>
        <h1 className="pixel-text text-shadow-pixel font-display text-display-lg text-parchment-100 uppercase sm:text-display-xl">
          {profile.name}
        </h1>
        <p className="font-ui text-ui-lg text-gold-400">
          {profile.role} · {profile.location}
        </p>
        <p className="max-w-prose font-body text-body-md text-parchment-100">{profile.tagline}</p>
      </header>

      <div className="flex min-h-36 w-full flex-col items-center justify-center gap-4">
        {phase === 'ready' ? (
          <PixelButton size="lg" onClick={onStart} autoFocus data-testid="press-start">
            <span className="blink-caret">▶</span>
            {copy.title.pressStart}
          </PixelButton>
        ) : (
          <LoadingScreen
            phase={phase}
            progress={progress}
            onQuickRead={onQuickRead}
            onRetry={onRetry}
          />
        )}
      </div>

      <nav aria-label={copy.modes.quickRead} className="flex flex-wrap justify-center gap-3">
        <PixelButton
          variant="secondary"
          iconLeft="book"
          onClick={onQuickRead}
          data-testid="open-quick-read"
        >
          {copy.modes.openQuickRead}
        </PixelButton>
        {profile.cv ? (
          <PixelButton
            variant="ghost"
            href={profile.cv.href}
            download={profile.cv.fileName}
            iconLeft="download"
          >
            {copy.actions.downloadCv}
          </PixelButton>
        ) : null}
      </nav>
    </main>
  );
}
