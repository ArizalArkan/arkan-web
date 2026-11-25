import type { ReactNode } from 'react';
import { copy } from '@/content/copy';
import type { Section } from '@/lib/route';
import { PixelFrame } from '@/ui/primitives/PixelFrame';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

type ChapterSectionProps = {
  id: Section;
  index: number;
  /** Themed place name, e.g. "Guild Hall". */
  place: string;
  /** Literal heading, e.g. "About" (UX-GUIDELINES.md §1.4). */
  title: string;
  children: ReactNode;
};

/** One portfolio section as a chapter: a chapter card, then a parchment window. */
export function ChapterSection({ id, index, place, title, children }: ChapterSectionProps) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-20 outline-none"
    >
      <p
        className="mb-3 flex items-baseline gap-3 font-ui text-ui-md text-dusk-300"
        data-qr="chapter"
      >
        <span className="pixel-text font-display text-display-md text-parchment-100">
          {NUMERALS[index] ?? index + 1}
        </span>
        <span>
          {copy.quickRead.chapter} · {place}
        </span>
      </p>
      <PixelFrame variant="parchment" padding="lg" className="flex flex-col gap-6" data-qr="window">
        <h2 id={`${id}-title`} className="pixel-text font-display text-display-md uppercase">
          {title}
        </h2>
        {children}
      </PixelFrame>
    </section>
  );
}
