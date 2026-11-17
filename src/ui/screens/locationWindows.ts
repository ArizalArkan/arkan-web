import type { WindowId } from '@/content/ids';

export type LocationWindowId = 'guild-hall' | 'quest-board' | 'armory' | 'library' | 'post-office';

export const isLocationWindow = (id: WindowId | null): id is LocationWindowId =>
  id === 'guild-hall' ||
  id === 'quest-board' ||
  id === 'armory' ||
  id === 'library' ||
  id === 'post-office';
