import { useEffect, useState } from 'react';
import { copy } from '@/content/copy';
import { loadingTips } from '@/content/dialogs';
import { ErrorState } from '../patterns/ErrorState';
import { PixelButton } from '../primitives/PixelButton';
import { StatBar } from '../primitives/StatBar';

export type LoadPhase = 'loading' | 'slow' | 'failed';

type LoadingScreenProps = {
  phase: LoadPhase;
  /** 0..1, from assets actually loaded; never moves backwards. */
  progress: number;
  onQuickRead: () => void;
  onRetry: () => void;
};

const TIP_MS = 3000;

/** Real progress, a rotating tip, and a way out when it drags (UX-GUIDELINES.md §2). */
export function LoadingScreen({ phase, progress, onQuickRead, onRetry }: LoadingScreenProps) {
  const [tip, setTip] = useState(0);

  useEffect(() => {
    if (phase === 'failed') return undefined;
    const timer = window.setInterval(
      () => setTip((index) => (index + 1) % loadingTips.length),
      TIP_MS,
    );
    return () => window.clearInterval(timer);
  }, [phase]);

  if (phase === 'failed') {
    return (
      <ErrorState
        illustration="alert"
        title={copy.loading.failedTitle}
        description={copy.loading.failedBody}
        action={{ label: copy.loading.retry, onClick: onRetry }}
        className="text-parchment-100"
      >
        <PixelButton variant="secondary" onClick={onQuickRead}>
          {copy.modes.openQuickRead}
        </PixelButton>
      </ErrorState>
    );
  }

  const percent = Math.round(progress * 100);
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3" data-testid="loading-screen">
      <StatBar kind="xp" label={copy.loading.label} value={percent} max={100} className="w-full" />
      <p className="min-h-12 text-center font-body text-body-sm text-dusk-300" aria-live="off">
        {loadingTips[tip]}
      </p>
      {phase === 'slow' ? (
        <p className="flex flex-wrap items-center justify-center gap-2 font-ui text-ui-md">
          {copy.loading.slow}
          <PixelButton variant="secondary" size="sm" onClick={onQuickRead}>
            {copy.modes.openQuickRead}
          </PixelButton>
        </p>
      ) : null}
    </div>
  );
}
