import { useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { audio } from '@/services/audio';
import { tabIds } from './tabIds';

type TabItem = { id: string; label: string };

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Prefix that links each tab to its panel (see tabIds). */
  idBase: string;
  label: string;
  className?: string;
};

/** Book-divider tabs (COMPONENTS.md §3.5). Arrow keys move and select. */
export function Tabs({ items, value, onChange, idBase, label, className }: TabsProps) {
  const refs = useRef(new Map<string, HTMLButtonElement>());

  const select = (id: string | undefined) => {
    if (!id) return;
    onChange(id);
    audio.play('cursor');
    refs.current.get(id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.id === value);
    const at = (next: number) => items[(next + items.length) % items.length]?.id;
    if (event.key === 'ArrowRight') select(at(index + 1));
    else if (event.key === 'ArrowLeft') select(at(index - 1));
    else if (event.key === 'Home') select(items[0]?.id);
    else if (event.key === 'End') select(items[items.length - 1]?.id);
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('flex gap-1 overflow-x-auto border-b-2 border-current/30', className)}
    >
      {items.map((item) => {
        const isSelected = item.id === value;
        const ids = tabIds(idBase, item.id);
        return (
          <button
            key={item.id}
            ref={(node) => {
              if (node) refs.current.set(item.id, node);
              else refs.current.delete(item.id);
            }}
            id={ids.tab}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={ids.panel}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => select(item.id)}
            className={cn(
              'stair -mb-0.5 min-h-11 shrink-0 px-4 font-ui text-ui-md font-semibold',
              isSelected
                ? 'bg-current/15 text-current underline decoration-2 underline-offset-4'
                : 'opacity-75 hover:opacity-100',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
