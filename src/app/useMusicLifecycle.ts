import { useEffect } from 'react';
import { useSettingsStore } from '@/game/stores/useSettingsStore';
import { music } from '@/services/music';

/**
 * Keeps background music in line with the saved preference across both
 * modes: never autoplays, resumes on the first gesture of a later visit,
 * and stops while the tab is hidden (UX-GUIDELINES.md §9.5).
 */
export function useMusicLifecycle() {
  useEffect(() => {
    const startOnGesture = () => {
      if (useSettingsStore.getState().music) music.start();
    };
    window.addEventListener('pointerdown', startOnGesture, { once: true });
    window.addEventListener('keydown', startOnGesture, { once: true });

    const onVisibility = () => {
      if (document.hidden) music.stop();
      else if (useSettingsStore.getState().music) music.start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const unsubscribe = useSettingsStore.subscribe((state, previous) => {
      if (previous.music && !state.music) music.stop();
    });

    return () => {
      window.removeEventListener('pointerdown', startOnGesture);
      window.removeEventListener('keydown', startOnGesture);
      document.removeEventListener('visibilitychange', onVisibility);
      unsubscribe();
    };
  }, []);
}
