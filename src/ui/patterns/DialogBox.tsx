import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { copy } from '@/content/copy';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/motion';
import { delayAfter } from '@/lib/typewriter';
import { audio } from '@/services/audio';
import { PixelFrame } from '../primitives/PixelFrame';
import { Portrait } from '../primitives/Portrait';

type Choice = { id: string; label: string };

type DialogBoxProps = {
  speaker: { name: string; portrait?: string };
  /** One page each, 140 characters max. */
  lines: string[];
  choices?: Choice[];
  onChoose?: (id: string) => void;
  onFinish?: () => void;
  /** ms per character; 0 = instant. Forced to 0 under reduced motion. */
  typeSpeed?: number;
  dismissible?: boolean;
  onClose?: () => void;
  className?: string;
};

type Phase = 'typing' | 'waiting' | 'choosing';

const ADVANCE_KEYS = new Set(['Enter', ' ', 'e', 'E']);

/** JRPG dialog with typewriter text (COMPONENTS.md §3.1). */
export function DialogBox({
  speaker,
  lines,
  choices = [],
  onChoose,
  onFinish,
  typeSpeed = 30,
  dismissible = true,
  onClose,
  className,
}: DialogBoxProps) {
  const reducedMotion = useReducedMotion();
  const speed = reducedMotion ? 0 : typeSpeed;
  const [page, setPage] = useState(0);
  const [shown, setShown] = useState(speed === 0 ? (lines[0]?.length ?? 0) : 0);
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const text = lines[page] ?? '';
  const isLastPage = page === lines.length - 1;
  const isComplete = shown >= text.length;
  const phase: Phase = !isComplete
    ? 'typing'
    : isLastPage && choices.length > 0
      ? 'choosing'
      : 'waiting';

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  // Reveal one character per tick; the pause after punctuation is longer.
  useEffect(() => {
    if (speed === 0 || isComplete) return undefined;
    const previous = shown > 0 ? (text[shown - 1] ?? '') : '';
    const timer = window.setTimeout(() => setShown(shown + 1), delayAfter(previous, speed));
    return () => window.clearTimeout(timer);
  }, [shown, text, speed, isComplete]);

  const goToPage = (next: number) => {
    setPage(next);
    setShown(speed === 0 ? (lines[next]?.length ?? 0) : 0);
  };

  const advance = () => {
    if (phase === 'typing') {
      setShown(text.length);
      return;
    }
    if (phase === 'choosing') {
      const choice = choices[cursor];
      if (choice) {
        audio.play('confirm');
        onChoose?.(choice.id);
      }
      return;
    }
    if (!isLastPage) {
      audio.play('cursor');
      goToPage(page + 1);
      return;
    }
    onFinish?.();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.repeat) return;
    if (event.key === 'Escape' && dismissible) {
      event.preventDefault();
      if (phase === 'choosing' && choices.length > 0) {
        // Cancel = the last choice, which is always the exit (UX §9.1).
        onChoose?.(choices[choices.length - 1]!.id);
      } else {
        onClose?.();
      }
      return;
    }
    if (phase === 'choosing' && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setCursor((current) => (current + delta + choices.length) % choices.length);
      audio.play('cursor');
      return;
    }
    if (ADVANCE_KEYS.has(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      advance();
    }
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('[data-choice]')) return;
        advance();
      }}
      data-testid="dialog-box"
      className={cn('w-full cursor-pointer outline-none select-none', className)}
    >
      <PixelFrame
        padding="md"
        className="min-h-28"
        title={<span id={titleId}>{speaker.name}</span>}
      >
        <div className="flex gap-4 pt-2">
          {speaker.portrait ? <Portrait src={speaker.portrait} alt="" size="md" /> : null}
          <div className="min-w-0 flex-1">
            {/* Screen readers get the whole page at once, never per character. */}
            <p className="sr-only" aria-live="polite">
              {text}
            </p>
            <p
              aria-hidden="true"
              className="min-h-[3.75rem] font-body text-body-lg text-parchment-100"
            >
              {text.slice(0, shown)}
              {isComplete && phase === 'waiting' ? (
                <span className="blink-caret ml-2 inline-block text-gold-400">▼</span>
              ) : null}
            </p>

            {phase === 'choosing' ? (
              <ul role="listbox" aria-label={speaker.name} className="mt-3 flex flex-col gap-1">
                {choices.map((choice, index) => (
                  <li
                    key={choice.id}
                    role="option"
                    aria-selected={index === cursor}
                    data-choice
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => {
                      audio.play('confirm');
                      onChoose?.(choice.id);
                    }}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-2 px-2 font-ui text-ui-lg',
                      index === cursor ? 'bg-night-700 text-gold-400' : 'text-parchment-100',
                    )}
                  >
                    <span
                      className={cn('w-4', index === cursor ? 'menu-cursor' : 'invisible')}
                      aria-hidden="true"
                    >
                      ▶
                    </span>
                    {choice.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <p className="mt-2 text-right font-ui text-ui-sm text-dusk-300">
          {phase === 'typing'
            ? copy.actions.skip
            : phase === 'waiting'
              ? copy.hints.next
              : copy.hints.select}
        </p>
      </PixelFrame>
    </div>
  );
}
