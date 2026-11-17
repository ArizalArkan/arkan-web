import { useEffect } from 'react';
import { world } from '@/content/world';
import { useUIStore } from '@/game/stores/useUIStore';

const SHOW_MS = 1800;

/** The place name, shown briefly on entering a zone (UX-GUIDELINES.md §8.3). */
export function LocationBanner() {
  const banner = useUIStore((state) => state.banner);
  const clearBanner = useUIStore((state) => state.clearBanner);

  useEffect(() => {
    if (!banner) return undefined;
    const timer = window.setTimeout(clearBanner, SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [banner, clearBanner]);

  const location = banner ? world.locations.find((entry) => entry.id === banner) : null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-[22%] z-10 flex justify-center px-4"
      data-testid="location-banner"
    >
      {location ? (
        <p className="toast-in flex flex-col items-center gap-1 text-center">
          <span className="pixel-text text-shadow-pixel font-display text-display-md text-parchment-100 uppercase sm:text-display-lg">
            {location.name}
          </span>
          <span className="text-shadow-pixel font-ui text-ui-md text-gold-400">
            {location.literal}
          </span>
        </p>
      ) : null}
    </div>
  );
}
