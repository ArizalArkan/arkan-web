import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { Sprite } from '../primitives/Sprite';

const SHOW_MS = 600;

/** Brief "x" where a tap could not be reached (UX-GUIDELINES.md §9.2). */
export function BlockedTapMarker() {
  const tap = usePlayerStore((state) => state.blockedTap);
  const [visibleNonce, setVisibleNonce] = useState<number | null>(null);

  useEffect(() => {
    if (!tap) return undefined;
    setVisibleNonce(tap.nonce);
    const timer = window.setTimeout(() => setVisibleNonce(null), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [tap]);

  if (!tap || visibleNonce !== tap.nonce) return null;
  return (
    <Sprite
      atlas="world"
      frame="marker/cross"
      anchor="center"
      position={[tap.x, 0.6, tap.z]}
      glow
      outline={false}
    />
  );
}
