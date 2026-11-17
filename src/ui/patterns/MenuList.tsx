import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { audio } from '@/services/audio';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/iconData';

export type MenuItem = {
  id: string;
  label: string;
  icon?: IconName;
  hint?: string;
  disabled?: boolean;
  badge?: ReactNode;
};

type MenuListProps = {
  items: MenuItem[];
  value: string | null;
  onChange: (id: string) => void;
  onConfirm: (id: string) => void;
  orientation?: 'vertical' | 'grid';
  /** Columns for grid orientation. */
  columns?: number;
  /** Accessible name of the list. */
  label: string;
  className?: string;
};

/** Vertical or grid menu with the ▶ cursor (COMPONENTS.md §3.2). */
export function MenuList({
  items,
  value,
  onChange,
  onConfirm,
  orientation = 'vertical',
  columns = 2,
  label,
  className,
}: MenuListProps) {
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter((item) => !item.disabled);
  const activeId = value ?? enabled[0]?.id ?? null;

  const move = (id: string | undefined) => {
    if (!id) return;
    onChange(id);
    audio.play('cursor');
    refs.current.get(id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (enabled.length === 0) return;
    const index = Math.max(
      0,
      enabled.findIndex((item) => item.id === activeId),
    );
    const step = orientation === 'grid' ? columns : 1;
    const wrap = (next: number) => enabled[(next + enabled.length) % enabled.length]?.id;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(wrap(index + step));
        return;
      case 'ArrowUp':
        event.preventDefault();
        move(wrap(index - step));
        return;
      case 'ArrowRight':
        if (orientation !== 'grid') return;
        event.preventDefault();
        move(wrap(index + 1));
        return;
      case 'ArrowLeft':
        if (orientation !== 'grid') return;
        event.preventDefault();
        move(wrap(index - 1));
        return;
      case 'Home':
        event.preventDefault();
        move(enabled[0]?.id);
        return;
      case 'End':
        event.preventDefault();
        move(enabled[enabled.length - 1]?.id);
        return;
      default:
        // Type-ahead: jump to the next item starting with that letter.
        if (event.key.length === 1 && /\S/.test(event.key) && !event.metaKey && !event.ctrlKey) {
          const letter = event.key.toLowerCase();
          const ordered = [...enabled.slice(index + 1), ...enabled.slice(0, index + 1)];
          const match = ordered.find((item) => item.label.toLowerCase().startsWith(letter));
          if (match) move(match.id);
        }
    }
  };

  return (
    <ul
      role="listbox"
      aria-label={label}
      aria-orientation={orientation === 'grid' ? undefined : 'vertical'}
      onKeyDown={onKeyDown}
      className={cn(orientation === 'grid' ? 'grid gap-2' : 'flex flex-col gap-2', className)}
      style={
        orientation === 'grid'
          ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
          : undefined
      }
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <li key={item.id} role="presentation">
            <button
              ref={(node) => {
                if (node) refs.current.set(item.id, node);
                else refs.current.delete(item.id);
              }}
              type="button"
              role="option"
              aria-selected={isActive}
              aria-disabled={item.disabled || undefined}
              tabIndex={isActive ? 0 : -1}
              onMouseEnter={() => !item.disabled && item.id !== activeId && onChange(item.id)}
              onFocus={() => !item.disabled && item.id !== activeId && onChange(item.id)}
              onClick={() => {
                if (item.disabled) return;
                audio.play('confirm');
                onConfirm(item.id);
              }}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && !item.disabled) {
                  event.preventDefault();
                  audio.play('confirm');
                  onConfirm(item.id);
                }
              }}
              className={cn(
                'flex min-h-11 w-full items-center gap-3 px-2 py-1 text-left font-ui text-ui-lg',
                isActive ? 'bg-night-700 text-gold-400' : 'text-parchment-100',
                item.disabled && 'cursor-default opacity-50',
              )}
            >
              <span
                className={cn('w-4 shrink-0', isActive ? 'menu-cursor' : 'invisible')}
                aria-hidden="true"
              >
                ▶
              </span>
              {item.icon ? <Icon name={item.icon} /> : null}
              <span className="flex min-w-0 flex-1 flex-col">
                <span>{item.label}</span>
                {item.hint ? (
                  <span className="font-ui text-ui-sm text-dusk-300">{item.hint}</span>
                ) : null}
              </span>
              {item.badge ?? null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
