import { z } from 'zod';

// Versioned local save (PRODUCT.md §7.6, ARCHITECTURE.md §8).
// Never throws: private mode, full quota or a corrupt value all fall back to
// defaults, and `isAvailable` tells the UI whether progress will persist.

export const SAVE_KEY = 'arkan-journey:save:v1';
export const SAVE_VERSION = 1;

const ids = z.array(z.string()).catch([]);

export const settingsSchema = z.object({
  mode: z.enum(['adventure', 'quick']).nullable().catch(null),
  quality: z.enum(['auto', 'high', 'medium', 'low']).catch('auto'),
  sound: z.boolean().catch(false),
  /** null = follow prefers-reduced-motion. */
  reducedMotion: z.boolean().nullable().catch(null),
});
export type SavedSettings = z.infer<typeof settingsSchema>;

export const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  /** Bumped on reset so another open tab cannot merge old progress back in. */
  epoch: z.number().int().nonnegative().catch(0),
  /** Informational; the game recomputes XP from the sets below. */
  xp: z.number().nonnegative().catch(0),
  visited: ids,
  questsRead: ids,
  linksOpened: ids,
  npcsMet: ids,
  collectibles: ids,
  achievements: ids,
  contactSent: z.boolean().catch(false),
  settings: settingsSchema.catch({
    mode: null,
    quality: 'auto',
    sound: false,
    reducedMotion: null,
  }),
});
export type SaveData = z.infer<typeof saveSchema>;

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  epoch: 0,
  xp: 0,
  visited: [],
  questsRead: [],
  linksOpened: [],
  npcsMet: [],
  collectibles: [],
  achievements: [],
  contactSent: false,
  settings: { mode: null, quality: 'auto', sound: false, reducedMotion: null },
});

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

// v0 is the shape first sketched in PRODUCT.md §7.6, before link tracking,
// contact flag and reset epoch existed.
const migrations: Record<number, Migration> = {
  0: (data) => ({ ...data, version: 1, epoch: 0, linksOpened: [], contactSent: false }),
};

export const migrate = (raw: unknown): SaveData | null => {
  if (!raw || typeof raw !== 'object') return null;
  let data = raw as Record<string, unknown>;
  let version = typeof data.version === 'number' ? data.version : 0;
  while (version < SAVE_VERSION) {
    const step = migrations[version];
    if (!step) return null;
    data = step(data);
    version += 1;
  }
  const parsed = saveSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
};

const probe = (storage: Storage) => {
  const key = `${SAVE_KEY}:probe`;
  storage.setItem(key, '1');
  storage.removeItem(key);
};

export const createSaveService = (getStorage: () => Storage | null) => {
  let storage: Storage | null = null;
  try {
    storage = getStorage();
    if (storage) probe(storage);
  } catch {
    storage = null;
  }

  return {
    isAvailable: storage !== null,

    load(): SaveData {
      if (!storage) return defaultSave();
      try {
        const text = storage.getItem(SAVE_KEY);
        if (!text) return defaultSave();
        return migrate(JSON.parse(text)) ?? defaultSave();
      } catch {
        return defaultSave();
      }
    },

    /** Returns false when the write failed (quota, private mode). */
    save(data: SaveData): boolean {
      if (!storage) return false;
      try {
        storage.setItem(SAVE_KEY, JSON.stringify(data));
        return true;
      } catch {
        return false;
      }
    },

    /** Parse a raw value from a `storage` event fired by another tab. */
    parseExternal(text: string | null): SaveData | null {
      if (!text) return null;
      try {
        return migrate(JSON.parse(text));
      } catch {
        return null;
      }
    },
  };
};

export type SaveService = ReturnType<typeof createSaveService>;

export const saveService = createSaveService(() =>
  typeof window === 'undefined' ? null : window.localStorage,
);
