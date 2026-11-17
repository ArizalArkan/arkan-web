import charactersAtlas from '@/world/atlases/characters.json';
import worldAtlas from '@/world/atlases/world.json';
import { resolveInitialMode, type Mode } from '@/game/rules/mode';
import { readModeParam } from '@/lib/route';

// Start-up checks (ARCHITECTURE.md §4.1) and the asset loader behind the
// title screen's progress bar.

export const hasWebgl = (() => {
  let cached: boolean | null = null;
  return () => {
    if (cached !== null) return cached;
    try {
      const canvas = document.createElement('canvas');
      cached = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
      cached = false;
    }
    return cached;
  };
})();

export const initialMode = (savedMode: Mode | null): { mode: Mode; reason: string } => {
  const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
  return resolveInitialMode({
    urlMode: readModeParam(window.location.search),
    savedMode,
    hasWebgl: hasWebgl(),
    prefersReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    saveData: connection?.saveData === true,
  });
};

const loadImage = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });

const RETRY_DELAYS = [800, 1600];

const withRetry = async <T>(task: () => Promise<T>) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      const delay = RETRY_DELAYS[attempt];
      if (delay === undefined) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Load everything the first scene needs, reporting real progress as each
 * piece finishes (UX-GUIDELINES.md §2.2). Each piece retries twice with
 * backoff before the whole load is reported as failed.
 */
export const loadAdventure = async (onProgress: (value: number) => void) => {
  let done = 0;
  const tasks: (() => Promise<unknown>)[] = [
    () => import('./AdventureApp'),
    () => loadImage(worldAtlas.image),
    () => loadImage(charactersAtlas.image),
    () => document.fonts.ready,
  ];
  onProgress(0);
  await Promise.all(
    tasks.map((task) =>
      withRetry(task).then(() => {
        done += 1;
        onProgress(done / tasks.length);
      }),
    ),
  );
};
