import { copy } from '@/content/copy';
import { cn } from '@/lib/cn';
import { formatRoute, type Section } from '@/lib/route';
import { MusicToggle } from '@/ui/hud/MusicToggle';
import { Icon } from '@/ui/primitives/Icon';
import type { IconName } from '@/ui/primitives/iconData';
import { PixelButton } from '@/ui/primitives/PixelButton';

export type NavItem = { section: Section; label: string; icon: IconName };

type QuickReadNavProps = {
  items: NavItem[];
  active: Section | null;
  canAdventure: boolean;
  onAdventure: () => void;
  showProgress: boolean;
};

/**
 * Sticky chapter menu. The ▶ cursor follows the section being read, the
 * same cursor the in-game menus use, so the page reads as one menu.
 */
export function QuickReadNav({
  items,
  active,
  canAdventure,
  onAdventure,
  showProgress,
}: QuickReadNavProps) {
  return (
    <nav
      aria-label={copy.modes.quickRead}
      className="sticky top-0 z-20 border-y-2 border-dusk-500 bg-night-900 print:hidden"
    >
      <div className="flex items-center gap-1 overflow-x-auto px-2 py-1 md:justify-center md:px-6">
        {items.map((item) => {
          const isActive = item.section === active;
          return (
            <a
              key={item.section}
              href={formatRoute({ kind: 'section', section: item.section })}
              aria-current={isActive ? 'location' : undefined}
              className={cn(
                'flex min-h-11 shrink-0 items-center gap-2 px-2 font-ui text-ui-md font-semibold hover:text-gold-400',
                isActive && 'text-gold-400',
              )}
            >
              <span
                className={cn('w-3', isActive ? 'menu-cursor' : 'invisible')}
                aria-hidden="true"
              >
                ▶
              </span>
              <Icon name={item.icon} />
              {item.label}
            </a>
          );
        })}
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <MusicToggle />
          {canAdventure ? (
            <PixelButton
              variant="ghost"
              size="sm"
              iconLeft="map"
              className="shrink-0"
              onClick={onAdventure}
              data-testid="to-adventure"
            >
              {copy.modes.adventure}
            </PixelButton>
          ) : null}
        </span>
      </div>
      {showProgress ? (
        <div
          className="qr-progress absolute inset-x-0 -bottom-0.5 h-0.5 bg-dusk-300"
          data-qr="progress"
          role="presentation"
        />
      ) : null}
    </nav>
  );
}
