import { music } from '@/services/music';
import { useSettingsStore } from './stores/useSettingsStore';

/**
 * Turn music on or off from a click. Starting has to happen inside the
 * gesture itself, or browsers keep the audio context locked.
 */
export const setMusicEnabled = (next: boolean) => {
  useSettingsStore.getState().setMusic(next);
  if (next) music.start();
  else music.stop();
};
