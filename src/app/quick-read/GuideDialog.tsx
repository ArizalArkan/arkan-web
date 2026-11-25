import { useEffect, useState } from 'react';
import { copy } from '@/content/copy';
import { useReducedMotion } from '@/lib/motion';
import { delayAfter } from '@/lib/typewriter';
import { MusicToggle } from '@/ui/hud/MusicToggle';

const START_MS = 1700; // after the title card settles
const PAGE_PAUSE_MS = 2600;
const TYPE_MS = 30;

/**
 * Wren's welcome as a cut-scene line: types once, turns the page once, then
 * stays. Purely presentational; the full text is always in the DOM for
 * screen readers and nothing here needs a click.
 */
export function GuideDialog() {
  const reducedMotion = useReducedMotion();
  const lines = copy.quickRead.guideLines;
  const [page, setPage] = useState(0);
  const [shown, setShown] = useState(reducedMotion ? Infinity : 0);
  const [started, setStarted] = useState(reducedMotion);

  useEffect(() => {
    if (started) return undefined;
    const timer = window.setTimeout(() => setStarted(true), START_MS);
    return () => window.clearTimeout(timer);
  }, [started]);

  const text = lines[page] ?? '';
  const isDone = shown >= text.length;

  useEffect(() => {
    if (!started || reducedMotion) return undefined;
    if (!isDone) {
      const previous = shown > 0 ? (text[shown - 1] ?? '') : '';
      const timer = window.setTimeout(() => setShown(shown + 1), delayAfter(previous, TYPE_MS));
      return () => window.clearTimeout(timer);
    }
    if (page < lines.length - 1) {
      const timer = window.setTimeout(() => {
        setPage(page + 1);
        setShown(0);
      }, PAGE_PAUSE_MS);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [started, reducedMotion, isDone, shown, text, page, lines.length]);

  return (
    <div className="qr-dialog" data-qr="dialog">
      <div className="mx-auto flex max-w-grid flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="qr-dialog-name font-ui text-ui-md font-semibold text-parchment-100">
            {copy.quickRead.guideName}
          </p>
          <p className="sr-only">{lines.join(' ')}</p>
          <p aria-hidden="true" className="mt-2 min-h-16 font-body text-body-lg text-parchment-100">
            {reducedMotion ? lines.join(' ') : started ? text.slice(0, shown) : ''}
            {isDone && started && !reducedMotion && page === lines.length - 1 ? (
              <span className="blink-caret ml-2 inline-block text-gold-400">▼</span>
            ) : null}
          </p>
        </div>
        <MusicToggle label={copy.quickRead.musicPrompt} />
      </div>
    </div>
  );
}
