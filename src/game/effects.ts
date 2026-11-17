import { copy, fill } from '@/content/copy';
import { analytics } from '@/services/analytics';
import { audio } from '@/services/audio';
import { events } from './events';
import { useUIStore } from './stores/useUIStore';

/**
 * Cross-store side effects: game events become toasts, sounds and analytics.
 * Wired once at app start; returns a cleanup for tests and HMR.
 */
export const startGameEffects = () =>
  events.on((event) => {
    const { pushToast } = useUIStore.getState();
    switch (event.type) {
      case 'xp':
        pushToast({
          kind: 'xp',
          title: fill(copy.toasts.xp, { amount: event.amount }),
          amount: event.amount,
        });
        return;
      case 'levelUp':
        pushToast({
          kind: 'achievement',
          title: fill(copy.toasts.levelUp, { level: event.level }),
        });
        audio.play('reward');
        return;
      case 'achievement':
        pushToast({
          kind: 'achievement',
          title: fill(copy.toasts.achievement, { name: event.name }),
        });
        audio.play('reward');
        analytics.track('achievement_unlocked', { id: event.id });
        return;
      case 'locationVisited':
        analytics.track('location_visited', { id: event.locationId });
        return;
      case 'questRead':
        analytics.track('quest_opened', { id: event.questId });
        return;
      case 'mainQuestComplete':
        return;
    }
  });
